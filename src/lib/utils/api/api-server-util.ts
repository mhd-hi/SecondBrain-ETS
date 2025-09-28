import { NextResponse } from 'next/server';

export const successResponse = <T>(data: T, statusCode = 200) => {
  return NextResponse.json(data, { status: statusCode });
};
