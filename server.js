const express = require('express');
const app = express();
const port = 3000;
const swaggerUi = require('swagger-ui-express')
const swaggerDocs = require('./swagger.json')

app.use('/v1', require('./handler'));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.get("/terms", (req, res) =>{
    return res.json({
        message: "Termos de Serviço",
    });
});


app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});