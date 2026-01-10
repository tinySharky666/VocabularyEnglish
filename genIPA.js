import fs from "fs";
import csv from "csv-parser";
import { createObjectCsvWriter } from "csv-writer";

const INPUT = "English.csv";
const OUTPUT = "Final.csv";

async function getIPA(word) {
  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );
    const data = await res.json();
    return data[0]?.phonetic || "";
  } catch {
    return "";
  }
}

function run() {
  const rows = [];

  fs.createReadStream(INPUT)
    .pipe(csv())
    .on("data", (data) => rows.push(data))
    .on("end", async () => {
      let id = 1;
      for (const row of rows) {
        if (!row.pronunciation) {
          row.id = id++
          row.pronunciation = await getIPA(encodeURIComponent(row.vocabulary));
        }
      }

      const writer = createObjectCsvWriter({
        path: OUTPUT,
        header: [
          { id: "id", title:"ID"},
          { id: "vocabulary", title: "Vocabulary" },
          { id: "pronunciation", title: "Pronunciation" },
          { id: "meaning", title: "Meaning" },
          { id: "note", title: "Image/Note" },
          { id: "examine", title:"Examine"}
        ]
      });

      await writer.writeRecords(rows);
      console.log("✔ Đã sinh IPA xong");
    });
}

run();
