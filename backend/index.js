const express = require("express");
const cors = require("cors");
const sheet = require("./data.json");
const fs = require("fs/promises");
const path = require("path");

async function getSheet() {
  return JSON.parse(
    await fs.readFile(path.join(__dirname, "data.json"), {
      encoding: "utf-8",
    })
  );
}

const app = express();

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  setTimeout(() => {
    next();
  }, 1000);
});

app.get("/attendance-sheets/:id", async (req, res) => {
  // const id = +req.params.id;

  const sheet = await getSheet();

  res.json(sheet.attendanceSheet);
});

app.post("/attendance-sheets/:id/sign", async (req, res) => {
  const studentId = +req.body.studentId;
  const signature = req.body.signature;

  const sheet = await getSheet();

  const student = sheet.attendanceSheet.STUDENTS.find(
    (s) => s.id === studentId
  );

  if (!student) {
    res.status(400).json({
      error: {
        message: `Student with id ${studentId} does not exists`,
      },
    });
    return;
  }

  if (student.presenceState) {
    res.status(400).json({
      error: {
        message: `Student with id ${studentId} already signed`,
      },
    });
    return;
  }

  student.signature = signature;
  student.presenceState = true;

  await fs.writeFile("data.json", JSON.stringify(sheet, null, 2), {
    encoding: "utf-8",
  });

  res.json(sheet.attendanceSheet);
});

app.listen(3000, () => {
  console.log("app started on port 3000");
});
