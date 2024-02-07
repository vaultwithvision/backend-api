import dotenv from 'dotenv';
// import DB/index here
import { app } from './app.js';
import connectToDB from './db/index.js';


dotenv.config(
    { path: './.env' }
);

// DB connection and configuration goes here
const startServer = async () => {
    try {
        await connectToDB().then(
                () => {
                    app.on("ERROR", (error) => {
                        console.log("ERROR : ",error);
                        throw error
                    });

                    app.listen(process.env.PORT || 8000, () => {
                        console.log(`Server is running at PORT : ${process.env.PORT}`);
                        console.log(`Your server is running on : http://localhost:${process.env.PORT}/api/v1/`);
                    })
                }
            ).catch(
                (error) => {
                    console.log("\nMONGODB Connection Failed!");
                    console.log(`\nReason : ${error}`);
                }
            )
    } catch (error) {
        console.log("\nMONGODB connection failed!");
        console.log(`\nReason : ${error}`);
    }
}

// Start DB Connection
startServer();
