const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3100;

// CORS 미들웨어 설정
app.use(cors({
  origin: '*', // 개발 환경에서는 모든 도메인 허용
  methods: ['GET'], // GET 메소드만 허용
  credentials: true
}));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/events', (req, res) => {
  // 버퍼링 비활성화
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no' // Nginx 버퍼링 비활성화
  });

  // 응답 스트림의 버퍼링 비활성화
  res.flushHeaders();

  // 초기 연결 메시지
  const data = 'data: {"message": "연결되었습니다"}\n\n';
  res.write(data);

  // 주기적으로 이벤트 전송
  const intervalId = setInterval(() => {
    const data = {
      time: new Date().toISOString(),
      value: Math.random()
    };
    // write 후에 end를 호출하지 않으면 자동으로 버퍼링 없이 전송됩니다
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }, 3000);

  // 클라이언트 연결 종료 시 정리
  req.on('close', () => {
    clearInterval(intervalId);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});