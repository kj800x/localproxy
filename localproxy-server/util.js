const getBody = (req) =>
  new Promise((acc, rej) => {
    body = [];
    req
      .on("error", (err) => {
        rej(err);
      })
      .on("data", (chunk) => {
        body.push(chunk);
      })
      .on("end", () => {
        body = Buffer.concat(body).toString();
        acc(body);
      });
  });

module.exports = { getBody };
