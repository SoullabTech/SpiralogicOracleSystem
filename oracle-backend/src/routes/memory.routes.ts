router.post('/memory/upload', upload.single('memoryFile'), async (req, res) => {
  const { file } = req;
  const userId = req.user?.id;

  if (!file || !userId) return res.status(400).send('Missing file or user');

  const content = await extractTextFromFile(file); // custom parser for txt/pdf/docx
  await saveToMemoryStore(userId, content);

  res.status(200).send('Memory stored');
});
