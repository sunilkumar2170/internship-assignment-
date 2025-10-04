const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const port = 3000;
const db = new sqlite3.Database("C:\\Users\\SUNIL\\Downloads\\data");


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");


app.get("/", (req, res) => {
  const { category, from, to } = req.query;

  let query = "SELECT * FROM expenses WHERE 1=1";
  const params = [];

  if (category) {
    query += " AND category LIKE ?";
    params.push(`%${category}%`);
  }
  if (from && to) {
    query += " AND date BETWEEN ? AND ?";
    params.push(from, to);
  }

  db.all(query, params, (err, rows) => {
    if (err) return console.error(err);
    const message = req.query.message || null;
    res.render("index", { expenses: rows, message });
  });
});

//  Add expense
app.get("/add", (req, res) => res.render("add"));

app.post("/add", (req, res) => {
  const { amount, date, note, category } = req.body;
  db.run(
    "INSERT INTO expenses (amount, date, note, category) VALUES (?, ?, ?, ?)",
    [amount, date, note, category],
    (err) => {
      if (err) return console.error(err);
      res.redirect("/?message=Expense added successfully!");
    }
  );
});

//  Delete expense
app.get("/delete/:id", (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM expenses WHERE id = ?", [id], (err) => {
    if (err) return console.error(err);
    res.redirect("/?message=Expense deleted successfully!");
  });
});

//  Edit expense
app.get("/edit/:id", (req, res) => {
  const id = req.params.id;
  db.get("SELECT * FROM expenses WHERE id = ?", [id], (err, row) => {
    if (err) return console.error(err);
    res.render("edit", { expense: row });
  });
});

app.post("/edit/:id", (req, res) => {
  const { id, amount, date, note, category } = req.body;
  db.run(
    "UPDATE expenses SET amount=?, date=?, note=?, category=? WHERE id=?",
    [amount, date, note, category, id],
    (err) => {
      if (err) return console.error(err);
      res.redirect("/?message=Expense updated successfully!");
    }
  );
});

//  Summary page
app.get("/summary", (req, res) => {
  db.all(
    "SELECT category, SUM(amount) AS total FROM expenses GROUP BY category",
    (err, rows) => {
      if (err) return console.error(err);
      res.render("summary", { summary: rows });
    }
  );
});


app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
