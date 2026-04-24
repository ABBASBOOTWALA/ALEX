export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('pdf') as File | null;

  if (!file || file.type !== 'application/pdf') {
    return Response.json({ error: 'Please upload a valid PDF file' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require('pdf-parse');
  const data = await pdfParse(buffer);

  return Response.json({
    rawText: data.text,
    pageCount: data.numpages,
    charCount: data.text.length,
  });
}
