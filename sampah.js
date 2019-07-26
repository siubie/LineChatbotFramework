var soko = {
  messages: [
    {
      type: "flex",
      altText: "Daftar Pesanan",
      contents: {
        type: "bubble",
        styles: { footer: { separator: true } },
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "PESANAN",
              weight: "bold",
              color: "#1DB446",
              size: "sm"
            },
            {
              type: "text",
              text: "Martabak Bahari",
              weight: "bold",
              size: "xxl",
              margin: "md"
            },
            {
              type: "text",
              text: "Jalan Saxofone Malang",
              size: "xs",
              color: "#aaaaaa",
              wrap: true
            },
            { type: "separator", margin: "xxl" },
            {
              type: "box",
              layout: "vertical",
              margin: "xxl",
              spacing: "sm",
              contents: [
                {
                  type: "box",
                  layout: "horizontal",
                  contents: [
                    {
                      type: "text",
                      text: "Energy Drink",
                      size: "sm",
                      color: "#555555",
                      flex: 0
                    },
                    {
                      type: "text",
                      text: "$2.99",
                      size: "sm",
                      color: "#111111",
                      align: "end"
                    }
                  ]
                },
                {
                  type: "box",
                  layout: "horizontal",
                  contents: [
                    {
                      type: "text",
                      text: "Chewing Gum",
                      size: "sm",
                      color: "#555555",
                      flex: 0
                    },
                    {
                      type: "text",
                      text: "$0.99",
                      size: "sm",
                      color: "#111111",
                      align: "end"
                    }
                  ]
                },
                {
                  type: "box",
                  layout: "horizontal",
                  contents: [
                    {
                      type: "text",
                      text: "Bottled Water",
                      size: "sm",
                      color: "#555555",
                      flex: 0
                    },
                    {
                      type: "text",
                      text: "$3.33",
                      size: "sm",
                      color: "#111111",
                      align: "end"
                    }
                  ]
                },
                { type: "separator", margin: "xxl" },
                {
                  type: "box",
                  layout: "horizontal",
                  margin: "xxl",
                  contents: [
                    {
                      type: "text",
                      text: "ITEMS",
                      size: "sm",
                      color: "#555555"
                    },
                    {
                      type: "text",
                      text: 5,
                      size: "sm",
                      color: "#111111",
                      align: "end"
                    }
                  ]
                },
                {
                  type: "box",
                  layout: "horizontal",
                  contents: [
                    {
                      type: "text",
                      text: "TOTAL",
                      size: "sm",
                      color: "#555555"
                    },
                    {
                      type: "text",
                      text: "$7.31",
                      size: "sm",
                      color: "#111111",
                      align: "end"
                    }
                  ]
                }
              ]
            }
          ]
        }
      },
      quickReply: {
        items: [
          {
            type: "action",
            action: { type: "message", label: "Lihat Menu", text: "menu" }
          }
        ]
      }
    }
  ],
  replyToken: "9c8090260e3e429c9796a0f94776d987"
};
