import { NextResponse } from 'next/server'

/**
 * Use this class to write responses from API route
 * endpoints to ensure that all endpoints use a standard
 * format.
 * 
 * This is based on the JSend specification.
 */
export default class APIResponse extends NextResponse {
    static success(data, status = 200) {
        return this.json({
            data: data
        }, {
            status: status
        });
    }

    static fail(data, status = 400) {

    }

    static error(message, status = 500) {

    }
}