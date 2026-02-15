// js/firebase-config.js
// ==========================================
// INSTRUÇÕES PARA ATIVAR A SINCRONIZAÇÃO:
// ==========================================
// 1. Acesse o Console do Firebase: https://console.firebase.google.com/
// 2. Crie um novo projeto (ou use um existente).
// 3. Adicione um app web ao projeto.
// 4. Copie o objeto 'firebaseConfig' gerado.
// 5. Cole o objeto abaixo substituindo o valor 'null'.
// 6. No menu "Build" -> "Realtime Database", crie o banco de dados.
// 7. Defina as regras de segurança (para teste inicial, pode usar modo 'test' ou regras abertas, mas cuidado em produção).
//
// Exemplo de configuração:
// const firebaseConfig = {
//   apiKey: "AIzaSy...",
//   authDomain: "seu-projeto.firebaseapp.com",
//   databaseURL: "https://seu-projeto-default-rtdb.firebaseio.com",
//   projectId: "seu-projeto",
//   storageBucket: "seu-projeto.appspot.com",
//   messagingSenderId: "123456...",
//   appId: "1:123456..."
// };

const firebaseConfig = null;

// Disponibiliza a configuração globalmente para o js/storage.js
window.firebaseConfig = firebaseConfig;
