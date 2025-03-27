<template>
  <div class="data-display">
    <div
      v-if="data && data.trim().length > 0"
      class="data-content"
      v-html="data"
    />
    <div v-else class="no-data">
      <div class="no-data-icon">📊</div>
      <p>No data to display yet</p>
      <p class="hint">Use the action buttons to load content</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    data: {
      type: String,
      required: true,
    },
  },
});
</script>

<style scoped>
.data-display {
  min-height: 300px;
  width: 100%;
  position: relative;
}

.data-content {
  padding: 0.5rem;
  overflow: auto;
  max-height: calc(100vh - 250px);
  line-height: 1.6;
}

.data-content :deep(h2),
.data-content :deep(h3),
.data-content :deep(h4) {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: var(--secondary-color);
}

.data-content :deep(ul),
.data-content :deep(ol) {
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}

.data-content :deep(pre) {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: var(--border-radius);
  overflow-x: auto;
  margin: 1rem 0;
  border: 1px solid #e9ecef;
}

.data-content :deep(a) {
  color: var(--primary-color);
  text-decoration: none;
}

.data-content :deep(a:hover) {
  text-decoration: underline;
}

.data-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.data-content :deep(th),
.data-content :deep(td) {
  border: 1px solid #e9ecef;
  padding: 0.75rem;
  text-align: left;
}

.data-content :deep(th) {
  background-color: #f8f9fa;
  font-weight: 600;
}

/* New styles for curated lists */
.data-content :deep(.curated-list) {
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: var(--border-radius);
  border-left: 4px solid var(--primary-color);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.data-content :deep(.list-title) {
  color: var(--primary-color);
  font-size: 1.25rem;
  margin-top: 0;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e9ecef;
}

.data-content :deep(.profile-list) {
  list-style-type: none;
  padding-left: 0.5rem;
}

.data-content :deep(.profile-item) {
  padding: 0.5rem 0;
  border-bottom: 1px dashed #e9ecef;
}

.data-content :deep(.profile-item:last-child) {
  border-bottom: none;
}

.data-content :deep(.profile-item strong) {
  color: var(--secondary-color);
}

.data-content :deep(.unmatched-profiles) {
  margin-top: 2rem;
  padding: 1rem;
  background-color: #fff8f8;
  border-radius: var(--border-radius);
  border-left: 4px solid var(--accent-color);
}

.data-content :deep(.unmatched-profiles .list-title) {
  color: var(--accent-color);
}

.data-content :deep(.suggestion) {
  font-style: italic;
  margin-top: 1rem;
  color: var(--text-light);
}

.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: var(--text-light);
}

.no-data-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.hint {
  font-size: 0.85rem;
  margin-top: 0.5rem;
}
</style>
