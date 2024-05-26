//モジュールのインポート
const https = require("https");         
const express = require("express");     

//Expressアプリケーションオブジェクトの生成
const app = express();

//環境変数の取得
const PORT = process.env.PORT || 3000;  //ポート番号
const TOKEN = process.env.LINE_ACCESS_TOKEN;

//ミドルウェアの設定
app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    })
);

//ルーティング設定
app.get("/", (req,res) => {
    res.sendStatus(200);
});

//リスナーの設定
app.listen(PORT, () =>{
    console.log(`Example app listening at http://localhost:${PORT}`);

});

//webhookに送られてくるリクエストを処理
app.post("/webhook", function(req,res){
    res.send("HTTP POST request sent to the webhook URL");
    //ユーザーがbotにメッセージを送った時、応答メッセージを送る
    if (req.body.events[0].type === "message"){
        //APIサーバに送信する応答トークンとメッセージデータを文字列化
        const dataString = JSON.stringify({
            //応答トークンを定義
            replyToken : req.body.events[0].replyToken,
            messages : [
                {
                    type : "text",
                    text : "hello world"
                },
                {
                    type : "text",
                    text : "May I help you"
                },
            ],
        });

        //リクエストヘッダー
        const headers = {
            "Content-Type": "application/json",
            Authorization: "Bearer " + TOKEN,
        };

        //Node.jsのhttps.requestメソッドで定義された仕様に従ってオプションを指定
        const webhookOptions = {
            hostname : "api.line.me",
            path : "/v2/bot/message/reply",
            method : "POST",
            headers : headers,
            body : dataString,
        };

        //messageタイプのHTTP POSTリクエストが/webhookエンドポイントに送信された場合、
        //変数webhookOptionsで定義した、https:/api.line.me/v2/bot/message/replyに対して
        //HTTP POSTリクエストを送信

        //リクエストを定義
        const request = https.request(webhookOptions, (res) => {
            res.on("data", (d) => {
                process.stdout.write(d);
            });
        });

        //エラーハンドリング
        //request.onは、APIサーバへのリクエスト送信時に
        //エラーが発生した場合にコールバックされる関数

        request.on("error", (err) => {
            console.error(err);
        });

        //定義したリクエストを送信
        request.write(dataString);
        request.end();
    }
});

