export class HttpError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = "HttpError";
        this.status = status;
    }
}

export class NotFoundError extends HttpError {
    constructor(message: string) {
        super(404, message);
        this.name = "NotFoundError";
    }
}

export class ForbiddenError extends HttpError {
    constructor(message: string) {
        super(403, message);
        this.name = "ForbiddenError";
    }
}

export class ConflictError extends HttpError {
    constructor(message: string) {
        super(409, message);
        this.name = "ConflictError";
    }
}
