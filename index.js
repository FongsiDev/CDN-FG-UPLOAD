const express = require("express"),
  imgur = require("imgur"),
  fs = require("fs"),
  fileUpload = require("express-fileupload"),
  app = express(),
  database = JSON.parse(fs.readFileSync("./database.json", "utf8"));
app.use(fileUpload());
app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/:id", (req, res) => {
	const link = database[req.params.id];
  res.render("embed.ejs", {link: link.link});
});

app.post("/upload", (req, res) => {
  if (!req.files) {
    return res.status(400).send("No files were uploaded.");
  }
  let sampleFile = req.files.sampleFile;
  let uploadPath = __dirname + "/uploads/" + sampleFile.name;
  sampleFile.mv(uploadPath, function (err) {
    if (err) {
      return res.status(500).send(err);
    }
    var id = makeid(7);
    imgur.uploadFile(uploadPath).then((urlObject) => {
      fs.unlinkSync(uploadPath);
      database[id] = { link: urlObject.link };
      fs.writeFileSync("./database.json", JSON.stringify(database, null, 2));
      res.render("uploaded.ejs", { link: "/"+id });
    });
  });
});

app.listen(8000, () => {
  console.log("Server started on port 3000");
});

function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}