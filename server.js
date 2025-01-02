require('dotenv').config();  // .env 파일 로드
const express = require('express');
const axios = require('axios');
const cors = require('cors');  // CORS 패키지 추가
const path = require('path');  // path 모듈 추가

const app = express();
const port = 3000;

// CORS 설정 (모든 도메인에서 요청 허용)
const corsOptions = {
    origin: 'http://localhost:8080',  // 허용할 도메인 (예: 클라이언트가 실행되는 도메인)
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// JSON body 파싱
app.use(express.json());

// 정적 파일 서빙 (public 폴더에 있는 파일들)
app.use(express.static(path.join(__dirname, 'public')));

// Hugging Face API 키
const apiKey = process.env.HUGGINGFACE_API_KEY;
console.log("API Key Loaded:", apiKey);  // API 키가 제대로 로드되는지 확인

const huggingFaceUrl = 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2';

// 캐릭터 생성 API 호출
app.post('/generate-image', async (req, res) => {
    const { keyword } = req.body;

    if (!keyword) {
        return res.status(400).json({ error: "키워드를 입력하세요!" });
    }

    try {
        // Hugging Face API에 요청
        const response = await axios.post(
            huggingFaceUrl,
            {
                inputs: keyword,
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,  // apiKey가 제대로 전달되도록 확인
                    'Content-Type': 'application/json',
                },
            }
        );

        // Hugging Face에서 받은 이미지 URL 반환
        const imageUrl = response.data?.data?.[0]?.url;

        if (imageUrl) {
            res.json({ imageUrl });
        } else {
            res.status(500).json({ error: '이미지 생성에 실패했습니다.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'API 요청에 실패했습니다.' });
    }
});

// 기본 경로 (root) 요청 시 index.html 반환
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 서버 시작
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
