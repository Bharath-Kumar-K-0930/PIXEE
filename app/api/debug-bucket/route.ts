import { NextResponse } from 'next/server';
import { storage } from '@/lib/firebase-admin';

export async function GET() {
    const report: any = {
        method: 'bucket.storage.getBuckets()',
        projectId: process.env.FIREBASE_PROJECT_ID,
        foundBuckets: [],
        error: null
    };

    if (!storage) {
        return NextResponse.json({ error: 'Storage not initialized' }, { status: 500 });
    }

    try {
        // Access the underlying Google Cloud Storage client
        // logic: storage.bucket() returns a Bucket object. 
        // bucket.storage refers to the Storage client instance that created it.
        // That client has getBuckets().
        const anyBucket = storage.bucket();
        const gcsClient = anyBucket.storage;

        const [buckets] = await gcsClient.getBuckets();
        report.foundBuckets = buckets.map(b => b.name);
        report.success = true;

    } catch (e: any) {
        report.success = false;
        report.error = {
            message: e.message,
            stack: e.stack,
            code: e.code
        };
    }

    // Save report to file (in case response is truncated)
    try {
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(process.cwd(), 'bucket_discovery_report.json');
        fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
        report.savedToFile = filePath;
    } catch (e) { }

    return NextResponse.json(report);
}
