const errorHandler = (error, _req, res, _next) => {
    res.header("Content-Type", 'application/json');
    res.status(420).send({ message: `Error: ${error.message}`});
}

export default errorHandler;
