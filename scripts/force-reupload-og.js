#!/usr/bin/env node
/**
 * OG/Hero画像を強制的に再アップロードするスクリプト
 * S3/R2上の既存ファイルを削除してから再アップロードします
 */

import { S3Client, DeleteObjectsCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

async function main() {
  const provider = process.env.IMAGE_HOSTING_PROVIDER || 'R2';
  const bucket = process.env.IMAGE_HOSTING_BUCKET;
  const accountId = process.env.R2_ACCOUNT_ID;

  // 認証情報を直接環境変数から取得
  const accessKeyId = provider === 'R2'
    ? process.env.R2_ACCESS_KEY_ID
    : process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = provider === 'R2'
    ? process.env.R2_SECRET_ACCESS_KEY
    : process.env.AWS_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    console.error('認証情報が見つかりません。.envファイルを確認してください。');
    console.error('Provider:', provider);
    console.error('必要な環境変数:');
    if (provider === 'R2') {
      console.error('  - R2_ACCESS_KEY_ID');
      console.error('  - R2_SECRET_ACCESS_KEY');
    } else {
      console.error('  - AWS_ACCESS_KEY_ID');
      console.error('  - AWS_SECRET_ACCESS_KEY');
    }
    process.exit(1);
  }

  if (!bucket) {
    console.error('IMAGE_HOSTING_BUCKETが設定されていません。');
    process.exit(1);
  }

  const endpoint = provider === 'R2'
    ? `https://${accountId}.r2.cloudflarestorage.com`
    : undefined;

  const client = new S3Client({
    region: provider === 'R2' ? 'auto' : (process.env.AWS_REGION || 'us-east-1'),
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });

  console.log('Provider:', provider);
  console.log('Bucket:', bucket);

  // og/ と hero/ 配下のファイルをリスト
  const prefixes = ['og/', 'hero/'];

  for (const prefix of prefixes) {
    console.log(`\n${prefix} 配下のファイルを削除中...`);

    const listCommand = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
    });

    const listResult = await client.send(listCommand);

    if (!listResult.Contents || listResult.Contents.length === 0) {
      console.log(`  ${prefix} にファイルがありません`);
      continue;
    }

    const objects = listResult.Contents.map(obj => ({ Key: obj.Key }));
    console.log(`  ${objects.length} ファイルを削除します`);

    const deleteCommand = new DeleteObjectsCommand({
      Bucket: bucket,
      Delete: { Objects: objects },
    });

    await client.send(deleteCommand);
    console.log(`  削除完了`);
  }

  console.log('\n削除完了。npm run build を実行して再アップロードしてください。');
}

main().catch(console.error);
