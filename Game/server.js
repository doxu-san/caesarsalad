const express = require('express');
const { BlobServiceClient } = require('@azure/storage-blob');
const bodyParser = require('body-parser');
//const { exec } = require('child_process');
const fs = require('fs');

const app = express();
const port = 3000;

//app.use(bodyParser.text());
app.use(bodyParser.json());

// ホームページの表示
app.get('/', (req, res) => {
  fs.readFile('./from_index/c_input.html', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.send(data);
  });
});

// Azure Blob Storage接続情報
const connectionString = 'ここにアクセスキー';
const containerName = 'test';

// Blob Serviceクライアントの作成
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerClient = blobServiceClient.getContainerClient(containerName);

// JSONリクエストの解析
//app.use(bodyParser.json());

// C言語コードを受け取り、Blob Storageにアップロード
app.post('/compile', async (req, res) => {
  try {
    const code = req.body.code; // クライアントから送信されたC言語のコード

    // Blobに書き込む
    const blobName = `code_${Date.now()}.c`; // Blobの名前を一意に設定
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.upload(code, code.length);

    res.status(200).send('Upload successful');
  } catch (error) {
    console.error('Error uploading code:', error);
    res.status(500).send('Internal Server Error');
  }
});


// C言語のコードを受け取り、WebAssemblyにコンパイルして返す
/*app.post('/compile', (req, res) => {
  const code = req.body;

  // .cファイルを作成
  fs.writeFile('temp.c', code, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }



    // emccを使ってWebAssemblyにコンパイル
    exec('setup_emscripten.bat && emcc temp.c -o temp.html', (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        res.status(500).send('Compilation Error');
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);

      // コンパイルされたHTMLファイルを読み込み、ユーザーに返す
      fs.readFile('temp.html', 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          res.status(500).send('Internal Server Error');
          return;
        }
        res.send(data); // 修正したHTMLをブラウザに提供
      });
    });
  });
});*/

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
