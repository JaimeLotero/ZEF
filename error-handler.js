class ZEFError {
    constructor(statusCode, externalErrorMsg, internalErrorMsg) {
        this.statusCode = statusCode;
        this.externalErrorMsg = externalErrorMsg;
        this.internalErrorMsg = internalErrorMsg;
    }
    toString() {
        return this.internalErrorMsg;
    }
}

function sendErrorResponse (res, statusCode, externalMsg) {
if (externalMsg instanceof Object){
        res.status(statusCode).json(externalMsg);
    } else {
        res.status(statusCode).send(externalMsg);
    }
}

function handleErrorResponse (err, res) {
    let date_string = '[' + (new Date().toISOString()) + ']';
    if (err instanceof ZEFError) {
        if (err.toString()) console.info(date_string + ' ' + err.toString());
        sendErrorResponse(res, err.statusCode, err.externalErrorMsg);
    } else {
        console.error(date_string + ' Unespecified error: ', err);
        res.status(500).send('Internal server error');
    }
}

function returnZEFError (err, statusCode, externalErrorMsg, internalErrorMsg) {
    if (err instanceof ZEFError) {
        return err;
    } else if (err instanceof Error){
        return new ZEFError(statusCode, 
            externalErrorMsg, 
            internalErrorMsg + ': ' + err.message);
    } 
    else {
        return new ZEFError(statusCode, externalErrorMsg, internalErrorMsg);
    }
}

module.exports = {
    ZEFError,
    handleErrorResponse,
    returnZEFError,
    sendErrorResponse
}