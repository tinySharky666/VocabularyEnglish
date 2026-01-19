import fs from "fs";
import csv from "csv-parser";
import { createObjectCsvWriter } from "csv-writer";

const INPUT = "English.csv";
const OUTPUT = "Final.csv";

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getInfoWord(word) {
  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );
    const data = await res.json();

    return {
      ipa: data[0]?.phonetic || "",
      class: [...new Set(
        (data[0]?.meanings || []).map(m => m.partOfSpeech)
      )].join(", ")
    }
  } catch {
    return { ipa: "", class: "" };
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
          let info = await getInfoWord((row.vocabulary))
          row.pronunciation = info.ipa;
          row.class = info.class
          await sleep(250);
        }
      }

      const writer = createObjectCsvWriter({
        path: OUTPUT,
        header: [
          { id: "id", title:"ID"},
          { id: "vocabulary", title: "Vocabulary" },
          { id: "class", title:"Class"},
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
