import { describe, it, expect } from "vitest";
import { HttpError, NotFoundError, ForbiddenError, ConflictError } from "@/lib/errors";

describe("HttpError", () => {
    it("creates an error with the given status and message", () => {
        const error = new HttpError(400, "Bad request");
        expect(error.status).toBe(400);
        expect(error.message).toBe("Bad request");
        expect(error.name).toBe("HttpError");
    });

    it("is an instance of Error", () => {
        const error = new HttpError(500, "Internal error");
        expect(error).toBeInstanceOf(Error);
    });

    it("is an instance of HttpError", () => {
        const error = new HttpError(422, "Unprocessable");
        expect(error).toBeInstanceOf(HttpError);
    });

    it("stores any HTTP status code", () => {
        expect(new HttpError(200, "OK").status).toBe(200);
        expect(new HttpError(404, "Not found").status).toBe(404);
        expect(new HttpError(503, "Service unavailable").status).toBe(503);
    });

    it("can be caught as a generic Error", () => {
        const fn = () => { throw new HttpError(400, "bad"); };
        expect(fn).toThrow(Error);
        expect(fn).toThrow("bad");
    });
});

describe("NotFoundError", () => {
    it("creates an error with status 404", () => {
        const error = new NotFoundError("Resource not found");
        expect(error.status).toBe(404);
        expect(error.message).toBe("Resource not found");
        expect(error.name).toBe("NotFoundError");
    });

    it("is an instance of HttpError", () => {
        const error = new NotFoundError("Not found");
        expect(error).toBeInstanceOf(HttpError);
    });

    it("is an instance of Error", () => {
        const error = new NotFoundError("Not found");
        expect(error).toBeInstanceOf(Error);
    });

    it("always has status 404 regardless of message", () => {
        const error = new NotFoundError("Customer not found in this bakery.");
        expect(error.status).toBe(404);
    });
});

describe("ForbiddenError", () => {
    it("creates an error with status 403", () => {
        const error = new ForbiddenError("Access denied");
        expect(error.status).toBe(403);
        expect(error.message).toBe("Access denied");
        expect(error.name).toBe("ForbiddenError");
    });

    it("is an instance of HttpError", () => {
        const error = new ForbiddenError("Forbidden");
        expect(error).toBeInstanceOf(HttpError);
    });

    it("is an instance of Error", () => {
        const error = new ForbiddenError("Forbidden");
        expect(error).toBeInstanceOf(Error);
    });

    it("always has status 403", () => {
        const error = new ForbiddenError("You are not allowed to update this customer.");
        expect(error.status).toBe(403);
    });
});

describe("ConflictError", () => {
    it("creates an error with status 409", () => {
        const error = new ConflictError("Resource conflict");
        expect(error.status).toBe(409);
        expect(error.message).toBe("Resource conflict");
        expect(error.name).toBe("ConflictError");
    });

    it("is an instance of HttpError", () => {
        const error = new ConflictError("Conflict");
        expect(error).toBeInstanceOf(HttpError);
    });

    it("is an instance of Error", () => {
        const error = new ConflictError("Conflict");
        expect(error).toBeInstanceOf(Error);
    });

    it("always has status 409", () => {
        const error = new ConflictError("cannot be deleted");
        expect(error.status).toBe(409);
    });
});

describe("error class hierarchy", () => {
    it("NotFoundError is not an instance of ForbiddenError", () => {
        const error = new NotFoundError("not found");
        expect(error).not.toBeInstanceOf(ForbiddenError);
        expect(error).not.toBeInstanceOf(ConflictError);
    });

    it("ForbiddenError is not an instance of NotFoundError", () => {
        const error = new ForbiddenError("forbidden");
        expect(error).not.toBeInstanceOf(NotFoundError);
        expect(error).not.toBeInstanceOf(ConflictError);
    });

    it("instanceof HttpError check works for all subclasses", () => {
        const errors: HttpError[] = [
            new NotFoundError("a"),
            new ForbiddenError("b"),
            new ConflictError("c"),
            new HttpError(418, "teapot"),
        ];
        for (const e of errors) {
            expect(e).toBeInstanceOf(HttpError);
        }
    });

    it("error names are distinct across subclasses", () => {
        expect(new HttpError(400, "x").name).toBe("HttpError");
        expect(new NotFoundError("x").name).toBe("NotFoundError");
        expect(new ForbiddenError("x").name).toBe("ForbiddenError");
        expect(new ConflictError("x").name).toBe("ConflictError");
    });
});