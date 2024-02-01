import mongoose from 'mongoose';

import { DB_NAME } from '../constants';



const connectToDB = async () => {

    try {
        const connectionInstance = await mongoose.connect(
            `${process.env.MONGODB_URI}/${DB_NAME}`
        );
        console.log(`\n MONGODB connected successfully...`);
        console.log(`\nDB HOST : ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB failed to connect !!", error)
        process.exit(1);
    }

}


export default connectToDB;