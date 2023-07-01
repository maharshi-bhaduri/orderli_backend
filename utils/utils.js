import * as admin from "firebase-admin";

function resUtil(res, httpstatuscode, statuscode, message, data) {
    const response = {
        operationStatus: {
            status: statuscode,
            message: message,
        },
        data: data,
    };
    return res.status(httpstatuscode).json(response);
}

const verifyAuth = (fn) => async (req, res) => {
    const serviceAccount = JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    );
    const adminapp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
    const { authorization, uid } = req.headers;

    try {
        admin
            .auth()
            .verifyIdToken(authorization)
            .then((decodedToken) => {
                req.decodedToken = decodedToken
                console.log("Operation authorized. Proceeding with the request.");
            })
            .catch((error) => {
                return resUtil(res, 403, "Unauthorized access detected.");
            });
    } catch (err) {
        return resUtil(res, 500, "Operation cannot be authorized at this time. Please try again later.");
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
    return await fn(req, res);
};

module.exports = { allowCors, resUtil, verifyAuth };
