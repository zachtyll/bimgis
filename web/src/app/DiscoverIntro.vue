<template>
  <section class="intro" aria-labelledby="intro-title">
    <h3 id="intro-title">Explore Luleå</h3>
    <ul>
      <li><strong>Buildings:</strong> click one for when it was built, what it's used for and its heritage value.</li>
      <li><strong>Trees:</strong> click one for its species and height.</li>
      <li><strong>Pins:</strong> what's on, and where.</li>
    </ul>
    <p class="muted">Something you'd like to change? Select it and choose <em>Have your say about this</em>.</p>
  </section>
</template>

<style scoped>
.intro {
  margin-bottom: 0.75rem;
  padding: 0.6rem 0.75rem;
  border-left: 4px solid var(--accent-discover);
  border-radius: 6px;
  background: #f0fdfa;
}

h3 {
  margin: 0 0 0.3rem;
}

ul {
  margin: 0;
  padding-left: 1.1rem;
  font-size: 0.9rem;
}

li {
  margin: 0.15rem 0;
}

.muted {
  margin: 0.4rem 0 0;
  color: #475569;
  font-size: 0.85rem;
}
</style>
