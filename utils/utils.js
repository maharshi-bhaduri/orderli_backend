import * as admin from "firebase-admin";

function resUtil(res, statuscode, message, data) {
    const response = {
        operationStatus: {
            status: statuscode,
            message: message,
        },
        data: data,
    };
    return res.status(statuscode).json(response);
}

const verifyAuth = (fn) => async (req, res) => {
    const serviceAccount = JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    );
    if (!admin.apps.length) {
        const adminapp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    }
    const { authorization, uid } = req.headers;

    try {
        await admin
            .auth()
            .verifyIdToken(authorization)
            .then((decodedToken) => {
                if (req.headers.uid !== decodedToken.uid) {
                    console.log("req.headers.uid ", req.headers.uid)
                    console.log("decodedToken.uid ", decodedToken.uid)
                    throw new Error("Unauthorized access detected.");
                }
                console.log("Operation authorized. Proceeding with the request.");
            })
            .catch((error) => {
                console.log(error)
                return resUtil(res, 401, "Unauthorized access detected.");
            });
    } catch (err) {
        return resUtil(res, 501, "Operation cannot be authorized at this time. Please try again later.");
    }
    return await fn(req, res);
};

const allowCors = (fn) => async (req, res) => {
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,OPTIONS,PATCH,DELETE,POST,PUT"
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, uid"
    );
    if (req.method === "OPTIONS") {
        res.status(200).end();
        return;
    }
    try {
        await fn(req, res);
    } catch (error) {
        console.error("An error occurred:", error);
        resUtil(res, 500, "An error occurred.");
        return; // Terminate the function after sending the response
    }
};

module.exports = { allowCors, resUtil, verifyAuth };
