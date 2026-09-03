const grades = [
  { name: '小学三年级', terms: [['上册', '3年级上'], ['下册', '3年级下']] },
  { name: '小学四年级', terms: [['上册', '4年级上'], ['下册（1）', '4年级下'], ['下册（2）', '4年级下']] },
  { name: '小学五年级', terms: [['上册', '5年级上'], ['下册', '5年级下']] },
  { name: '小学六年级', terms: [['上册', '6年级上'], ['下册', '6年级下']] },
  { name: '初中七年级', terms: [['上册', '初一年级上'], ['下册', '初一年级下']] },
  { name: '初中八年级', terms: [['上册', '初二年级上'], ['下册', '初二年级下']] },
  { name: '初中九年级', terms: [['上册', '初三年级上'], ['下册', '初三年级下']] },
  { name: '高中一年级', terms: [['上册', '高一年级上'], ['下册', '高一年级下']] },
  { name: '高中二年级', terms: [['上册', '高二年级上'], ['下册', '高二年级下']] },
  { name: '高中三年级', terms: [['上册', '高三年级上'], ['下册（1）', '高三年级下'], ['下册（2）', '高三年级下']] }
];

let gradeIndex = 0;
let termIndex = 0;

const gradeTabs = document.querySelector('#grade-tabs');
const termTabs = document.querySelector('#term-tabs');
const chips = document.querySelector('#word-chips');

function speak(word) {
  if (!('speechSynthesis' in window)) {
    alert('当前浏览器不支持语音播放。');
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = 'en-US';
  utterance.rate = 0.78;
  utterance.pitch = 1;
  const englishVoice = window.speechSynthesis.getVoices().find((voice) => /^en(-|_)/i.test(voice.lang));
  if (englishVoice) utterance.voice = englishVoice;
  window.speechSynthesis.speak(utterance);
}

function getWords(gradeName, termLabel) {
  const terms = window.vocabAudioData?.[gradeName] || {};
  return terms[termLabel] || [];
}

function getPronunciations(gradeName, termLabel) {
  const terms = window.vocabPronunciationData?.[gradeName] || {};
  return terms[termLabel] || {};
}

function getMeanings(gradeName, termLabel) {
  const terms = window.vocabMeaningData?.[gradeName] || {};
  return terms[termLabel] || {};
}

function groupWords(words) {
  const groupSize = 40;
  const groups = [];
  for (let index = 0; index < words.length; index += groupSize) {
    groups.push({
      title: `Unit ${Math.floor(index / groupSize) + 1}`,
      words: words.slice(index, index + groupSize)
    });
  }
  return groups;
}

function render() {
  const grade = grades[gradeIndex];
  const term = grade.terms[termIndex];
  const words = getWords(grade.name, term[0]);
  const pronunciations = getPronunciations(grade.name, term[0]);
  const meanings = getMeanings(grade.name, term[0]);

  document.querySelector('#grade-heading').textContent = grade.name;
  document.querySelector('#progress').textContent = `${gradeIndex + 1} / ${grades.length}`;

  gradeTabs.replaceChildren(...grades.map((item, index) => {
    const button = document.createElement('button');
    button.textContent = item.name;
    button.className = index === gradeIndex ? 'active' : '';
    button.onclick = () => {
      gradeIndex = index;
      termIndex = 0;
      render();
    };
    return button;
  }));

  termTabs.replaceChildren(...grade.terms.map((item, index) => {
    const button = document.createElement('button');
    button.textContent = item[0];
    button.className = index === termIndex ? 'active' : '';
    button.onclick = () => {
      termIndex = index;
      render();
    };
    return button;
  }));

  chips.replaceChildren(...groupWords(words).map((group) => {
    const section = document.createElement('section');
    section.className = 'unit-section';

    const heading = document.createElement('h4');
    heading.className = 'unit-heading';
    heading.textContent = group.title;

    const list = document.createElement('div');
    list.className = 'unit-word-list';

    list.replaceChildren(...group.words.map((word) => {
      const button = document.createElement('button');
      const pronunciation = pronunciations[word] || '';
      const meaning = meanings[word] || '';
      button.className = 'word-chip';
      button.type = 'button';
      button.setAttribute('aria-label', pronunciation ? `播放 ${word}，读音 ${pronunciation}` : `播放 ${word} 的英语读音`);
      button.addEventListener('click', () => speak(word));

      const label = document.createElement('span');
      label.className = 'word-chip-label';
      label.textContent = word;

      const sound = document.createElement('span');
      sound.className = 'word-chip-sound';
      sound.textContent = pronunciation ? `/${pronunciation}/` : '点击听读音';

      const meaningLine = document.createElement('span');
      meaningLine.className = 'word-chip-meaning';
      meaningLine.textContent = meaning ? meaning : '';

      button.append(label, sound, meaningLine);
      return button;
    }));

    section.append(heading, list);
    return section;
  }));

  document.querySelector('#audio-note').textContent = words.length
    ? `本册共有 ${words.length} 个词条，点击即可播放。`
    : '当前册别还没有词条。';
  document.querySelector('#encouragement').textContent = `${grade.name}${term[0]}：今天多记一个词，已经很不错。`;
}

document.querySelector('#manual-speaker').addEventListener('submit', (event) => {
  event.preventDefault();
  const word = document.querySelector('#manual-word').value.trim();
  if (word) speak(word);
});

render();
