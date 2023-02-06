<script setup>
import { nextTick, onMounted, ref } from "vue";
import SignaturePad from "signature_pad";

const sheet = ref();
const loading = ref(true);
const inSignMode = ref(false);
const currStudentId = ref();
const signaturePad = ref();

function enableSignMode(studentId) {
  inSignMode.value = true;
  currStudentId.value = studentId;

  nextTick(() => {
    const canvas = document.querySelector("#sign-canvas");

    signaturePad.value = new SignaturePad(canvas);
  });
}

async function sign() {
  const dataUrl = signaturePad.value.toDataURL();
  const headers = new Headers();
  headers.append("Content-Type", "application/json");

  sheet.value = await fetch("http://localhost:3000/attendance-sheets/1/sign", {
    method: "post",
    headers,
    body: JSON.stringify({
      studentId: currStudentId.value,
      signature: dataUrl,
    }),
  }).then(r => r.json())

  inSignMode.value = false;
}

onMounted(async () => {
  try {
    sheet.value = await fetch("http://localhost:3000/attendance-sheets/1").then(
      (r) => r.json()
    );
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <header>
    <h1>Edusign</h1>
  </header>

  <main>
    <div v-if="loading">Chargement de la feuille de présence en cours...</div>

    <div v-else-if="sheet">
      <div v-if="inSignMode">
        <canvas
          id="sign-canvas"
          style="border: 1px solid black; width: 400px; height: 200px"
        ></canvas>
        <br />
        <button @click="sign">Valider la signature</button>
      </div>

      <ul>
        <li v-for="student in sheet.STUDENTS" :key="student.id" style="margin-bottom: 40px;">
          <div>{{ student.FIRSTNAME }} {{ student.LASTNAME }}</div>
          <div>
            {{ student.presenceState === true ? "Présent" : "Non présent" }}
          </div>
          <div v-if="student.presenceState === false">
            <button @click="enableSignMode(student.id)">Signer</button>
          </div>
          <div v-else>
            <img :src="student.signature" />
          </div>
        </li>
      </ul>
    </div>
  </main>
</template>

<style scoped></style>
