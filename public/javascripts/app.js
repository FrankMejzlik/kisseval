$(document).foundation()


function get(url) {
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();
    req.open('GET', url);
    req.onload = () => req.status === 200 ? resolve(req.response) : reject(Error(req.statusText));
    req.onerror = (e) => reject(Error(`Network Error: ${e}`));
    req.send();
  });
} 

function post(url, data) {
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();
    req.open('POST', url);
    req.onload = () => req.status === 200 ? resolve(req.response) : reject(Error(req.statusText));
    req.onerror = (e) => reject(Error(`Network Error: ${e}`));
    req.send(data);
  });
} 