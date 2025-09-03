use std::{
    collections::HashMap,
    fmt,
    fs::File,
    io::{self, Read, Write},
    net::{TcpListener, TcpStream},
    str::FromStr,
};

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum HTTPMethod {
    GET,
    POST,
}

#[derive(Debug, Clone)]
struct ParseHTTPMethodError;

impl fmt::Display for ParseHTTPMethodError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "unsupported HTTP method")
    }
}

impl std::error::Error for ParseHTTPMethodError {}

impl FromStr for HTTPMethod {
    type Err = ParseHTTPMethodError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_ascii_uppercase().as_str() {
            "GET" => Ok(HTTPMethod::GET),
            "POST" => Ok(HTTPMethod::POST),
            _ => Err(ParseHTTPMethodError),
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
enum Operation {
    #[serde(rename = "+")]
    Add,
    #[serde(rename = "-")]
    Sub,
    #[serde(rename = "*")]
    Mul,
    #[serde(rename = "/")]
    Div,
}

#[derive(Serialize, Deserialize, Debug)]
struct Calculation {
    op: Operation,
    rhs: f64,
    lhs: f64,
}

#[derive(Serialize)]
struct CalcResponse {
    error: Option<String>,
    result: Option<f64>,
}

fn get(stream: &mut TcpStream, path: &str) -> Result<(), io::Error> {
    if path != "/" {
        let res = "HTTP/1.1 404 Not Found\r\nContent-Length: 0\r\n\r\n";
        stream.write_all(res.as_bytes())?;
        stream.flush()?;
        return Ok(());
    }

    let mut file = File::open("./frontend/index.html")?;
    let mut content = String::new();
    file.read_to_string(&mut content)?;

    let res = format!(
        "HTTP/1.1 200 OK\r\n\
         Content-Type: text/html; charset=UTF-8\r\n\
         Content-Length: {}\r\n\
         \r\n\
         {}",
        content.len(),
        content
    );

    stream.write_all(res.as_bytes())?;
    stream.flush()?;

    Ok(())
}

fn post(stream: &mut TcpStream, body: &str, path: &str) -> Result<(), std::io::Error> {
    if path != "/calc" {
        let res = "HTTP/1.1 404 Not Found\r\nContent-Length: 0\r\n\r\n";
        stream.write_all(res.as_bytes())?;
        stream.flush()?;
        return Ok(());
    }

    let response = match serde_json::from_str::<Calculation>(body) {
        Ok(calc) => {
            let result = match calc.op {
                Operation::Add => Ok(calc.lhs + calc.rhs),
                Operation::Sub => Ok(calc.lhs - calc.rhs),
                Operation::Mul => Ok(calc.lhs * calc.rhs),
                Operation::Div => {
                    if calc.rhs == 0.0 {
                        Err("division by zero".to_string())
                    } else {
                        Ok(calc.lhs / calc.rhs)
                    }
                }
            };

            match result {
                Ok(val) => CalcResponse {
                    error: None,
                    result: Some(val),
                },
                Err(e) => CalcResponse {
                    error: Some(e),
                    result: None,
                },
            }
        }
        Err(e) => CalcResponse {
            error: Some(format!("invalid JSON: {}", e)),
            result: None,
        },
    };

    let body = serde_json::to_string(&response).unwrap();

    let res = format!(
        "HTTP/1.1 200 OK\r\n\
         Content-Type: application/json; charset=UTF-8\r\n\
         Content-Length: {}\r\n\
         \r\n\
         {}",
        body.len(),
        body
    );

    stream.write_all(res.as_bytes())?;
    stream.flush()?;

    Ok(())
}

fn read_req(stream: &mut TcpStream) -> Result<(String, String), std::io::Error> {
    let mut buf = Vec::new();
    let mut tmp = [0; 512];

    loop {
        let n = stream.read(&mut tmp)?;
        if n == 0 {
            break; // connection closed
        }
        buf.extend_from_slice(&tmp[..n]);

        if buf.windows(4).any(|w| w == b"\r\n\r\n") {
            break;
        }
    }

    if buf.is_empty() {
        return Ok((String::new(), String::new()));
    }

    let headers_str = String::from_utf8_lossy(&buf);
    let headers_end = headers_str.find("\r\n\r\n").unwrap() + 4;
    let (headers, maybe_body) = buf.split_at(headers_end);

    let headers_text = String::from_utf8_lossy(headers);

    // parse Content-Length
    let mut headers_map = HashMap::new();
    for line in headers_text.lines() {
        if let Some((key, val)) = line.split_once(":") {
            headers_map.insert(key.trim().to_lowercase(), val.trim().to_string());
        }
    }

    let content_length = headers_map
        .get("content-length")
        .and_then(|v| v.parse::<usize>().ok())
        .unwrap_or(0);

    let mut body = maybe_body.to_vec();
    while body.len() < content_length {
        let n = stream.read(&mut tmp)?;
        if n == 0 {
            break;
        }
        body.extend_from_slice(&tmp[..n]);
    }

    Ok((
        headers_text.into_owned(),
        String::from_utf8_lossy(&body).into_owned(),
    ))
}

fn handle_client(mut stream: TcpStream) {
    loop {
        let (headers, body) = match read_req(&mut stream) {
            Ok(r) => r,
            Err(e) => {
                eprintln!("Failed to read request: {}", e);
                break;
            }
        };

        if headers.is_empty() {
            println!("Client Disconnected!");
            break;
        }

        let mut req_line = headers
            .split("\r\n")
            .nth(0)
            .unwrap_or("")
            .split_whitespace();

        let method = match req_line.next().unwrap_or("").parse::<HTTPMethod>() {
            Ok(m) => m,
            Err(_) => {
                eprintln!("Unsupported HTTP method");
                break;
            }
        };

        let path = req_line.next().unwrap_or("/");

        match method {
            HTTPMethod::GET => {
                if let Err(e) = get(&mut stream, path) {
                    eprintln!("Failed to handle GET: {}", e);
                }
            }
            HTTPMethod::POST => {
                if let Err(e) = post(&mut stream, &body, path) {
                    eprintln!("Failed to handle POST: {}", e);
                }
            }
        }
    }
}

fn main() {
    let listener = TcpListener::bind("127.0.0.1:8000").expect("Failed to bind address to socket");
    println!("Serving on http://{}/", listener.local_addr().unwrap());

    for stream in listener.incoming() {
        if let Ok(stream) = stream {
            println!("New connection from {}", stream.peer_addr().unwrap());
            handle_client(stream);
        }
    }
}
