import { NextResponse } from 'next/server';

export const statusResponse = <T>(data: T, statusCode = 200) => {
  return NextResponse.json(data, { status: statusCode });
};
