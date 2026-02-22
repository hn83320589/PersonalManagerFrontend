<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <section class="bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
            技能與專長
          </h1>
          <p class="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            我的技術能力、工具與專業領域的全面概觀。
          </p>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div v-if="isLoading" class="flex justify-center">
        <LoadingSpinner />
      </div>

      <div v-else-if="skills.length > 0">
        <!-- Filter Tabs -->
        <div class="mb-12">
          <div class="border-b border-gray-200">
            <nav class="-mb-px flex space-x-8">
              <button
                v-for="tab in filterTabs"
                :key="tab.key"
                :class="[
                  'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                  activeFilter === tab.key
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                ]"
                @click="activeFilter = tab.key"
              >
                {{ tab.label }}
                <span
                  v-if="tab.count"
                  :class="[
                    'ml-2 py-0.5 px-2 rounded-full text-xs',
                    activeFilter === tab.key
                      ? 'bg-primary-100 text-primary-600'
                      : 'bg-gray-100 text-gray-600',
                  ]"
                >
                  {{ tab.count }}
                </span>
              </button>
            </nav>
          </div>
        </div>

        <!-- Skills Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Expert Skills Highlight -->
          <div
            v-if="activeFilter === 'all' && expertSkills.length > 0"
            class="md:col-span-2 lg:col-span-3"
          >
            <BaseCard
              title="專家級"
              class="mb-8 bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200"
            >
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div
                  v-for="skill in expertSkills"
                  :key="skill.id"
                  class="flex items-center space-x-3 p-3 bg-white rounded-lg border border-primary-200"
                >
                  <div
                    class="w-3 h-3 bg-gradient-to-r from-primary-500 to-blue-500 rounded-full"
                  ></div>
                  <div class="flex-1">
                    <h4 class="font-medium text-gray-900">{{ skill.name }}</h4>
                    <p
                      v-if="skill.yearsOfExperience"
                      class="text-xs text-gray-600"
                    >
                      {{ skill.yearsOfExperience }}+ 年
                    </p>
                  </div>
                </div>
              </div>
            </BaseCard>
          </div>

          <!-- Skill Categories or Filtered Skills -->
          <template v-if="activeFilter === 'all'">
            <BaseCard
              v-for="(categorySkills, category) in skillsByCategory"
              :key="category"
              :title="category"
              class="skill-category-card"
            >
              <template #actions>
                <span class="text-sm text-gray-500"
                  >{{ categorySkills.length }} 項技能</span
                >
              </template>

              <div class="space-y-4">
                <div
                  v-for="skill in categorySkills"
                  :key="skill.id"
                  class="skill-item"
                >
                  <div class="flex items-center justify-between mb-2">
                    <h4 class="font-medium text-gray-900">{{ skill.name }}</h4>
                    <span :class="getSkillLevelBadgeClass(skill.level)">
                      {{ getSkillLevelLabel(skill.level) }}
                    </span>
                  </div>

                  <!-- Skill Level Visualization -->
                  <div class="flex items-center space-x-3">
                    <div class="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        :class="getSkillLevelBarClass(skill.level)"
                        :style="{
                          width: `${(skillLevelToNumber(skill.level) / 4) * 100}%`,
                        }"
                        class="h-2 rounded-full transition-all duration-300"
                      ></div>
                    </div>
                    <div class="flex space-x-1">
                      <div
                        v-for="level in 4"
                        :key="level"
                        :class="[
                          'w-2 h-2 rounded-full transition-colors',
                          level <= skillLevelToNumber(skill.level)
                            ? getSkillLevelDotClass(skill.level)
                            : 'bg-gray-200',
                        ]"
                      ></div>
                    </div>
                  </div>

                  <div
                    v-if="skill.yearsOfExperience"
                    class="mt-2 text-xs text-gray-500"
                  >
                    {{ skill.yearsOfExperience }} 年經驗
                  </div>
                </div>
              </div>
            </BaseCard>
          </template>

          <template v-else>
            <BaseCard
              v-for="skill in filteredSkills"
              :key="skill.id"
              class="skill-card"
            >
              <div class="text-center space-y-4">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">
                    {{ skill.name }}
                  </h3>
                  <p v-if="skill.category" class="text-sm text-gray-500">
                    {{ skill.category }}
                  </p>
                </div>

                <!-- Large Skill Level Circle -->
                <div class="flex justify-center">
                  <div class="relative w-24 h-24">
                    <svg
                      class="w-24 h-24 transform -rotate-90"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="2"
                        fill="none"
                        class="text-gray-200"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="2"
                        fill="none"
                        :class="getSkillLevelColorClass(skill.level)"
                        :stroke-dasharray="`${(skillLevelToNumber(skill.level) / 4) * 62.83} 62.83`"
                        class="transition-all duration-500"
                      />
                    </svg>
                    <div
                      class="absolute inset-0 flex items-center justify-center"
                    >
                      <span class="text-sm font-medium text-gray-900">
                        {{
                          Math.round(
                            (skillLevelToNumber(skill.level) / 4) * 100,
                          )
                        }}%
                      </span>
                    </div>
                  </div>
                </div>

                <div class="space-y-2">
                  <span :class="getSkillLevelBadgeClass(skill.level)">
                    {{ getSkillLevelLabel(skill.level) }}
                  </span>

                  <div
                    v-if="skill.yearsOfExperience"
                    class="text-sm text-gray-600"
                  >
                    {{ skill.yearsOfExperience }} 年經驗
                  </div>
                </div>
              </div>
            </BaseCard>
          </template>
        </div>

        <!-- Skills Statistics -->
        <section class="mt-16">
          <BaseCard title="技能總覽" class="bg-gray-50">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div class="text-center">
                <div class="text-3xl font-bold text-primary-600">
                  {{ skills.length }}
                </div>
                <div class="text-sm text-gray-600">總技能數</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-green-600">
                  {{ expertSkills.length }}
                </div>
                <div class="text-sm text-gray-600">專家級</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-blue-600">
                  {{ Object.keys(skillsByCategory).length }}
                </div>
                <div class="text-sm text-gray-600">分類數</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-purple-600">
                  {{ averageYearsExperience }}+
                </div>
                <div class="text-sm text-gray-600">平均經驗年數</div>
              </div>
            </div>
          </BaseCard>
        </section>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16">
        <CodeBracketIcon class="mx-auto h-16 w-16 text-gray-400" />
        <h3 class="mt-4 text-lg font-medium text-gray-900">尚無技能資料</h3>
        <p class="mt-2 text-gray-500">有技能資訊時將顯示於此。</p>
      </div>

      <!-- Call to Action -->
      <section v-if="skills.length > 0" class="mt-16">
        <BaseCard class="bg-primary-50 border-primary-200">
          <div class="text-center space-y-4">
            <h3 class="text-xl font-semibold text-gray-900">
              看看這些技能的實際應用
            </h3>
            <p class="text-gray-600">
              瀏覽我的作品集，了解我如何將這些技能運用在實際專案中。
            </p>
            <div class="flex justify-center space-x-4">
              <router-link to="/portfolio">
                <BaseButton variant="primary"> 查看作品集 </BaseButton>
              </router-link>
              <router-link to="/contact">
                <BaseButton variant="outline"> 一起合作 </BaseButton>
              </router-link>
            </div>
          </div>
        </BaseCard>
      </section>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { CodeBracketIcon } from "@heroicons/vue/24/outline";
import { useSkillStore } from "@/stores/skill";
import LoadingSpinner from "@/components/common/LoadingSpinner.vue";
import BaseCard from "@/components/ui/BaseCard.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import type { SkillLevel } from "@/types/api";

// Stores
const skillStore = useSkillStore();

// State
const isLoading = ref(true);
const activeFilter = ref("all");

// Computed
const skills = computed(() => skillStore.publicSkills);
const skillsByCategory = computed(() => skillStore.skillsByCategory);
const skillsByLevel = computed(() => skillStore.skillsByLevel);
const expertSkills = computed(() => skillStore.expertSkills);

const filterTabs = computed(() => [
  { key: "all", label: "所有分類", count: skills.value.length },
  {
    key: "expert",
    label: "專家",
    count: skillsByLevel.value["Expert"]?.length || 0,
  },
  {
    key: "advanced",
    label: "進階",
    count: skillsByLevel.value["Advanced"]?.length || 0,
  },
  {
    key: "intermediate",
    label: "中級",
    count: skillsByLevel.value["Intermediate"]?.length || 0,
  },
  {
    key: "beginner",
    label: "初學",
    count: skillsByLevel.value["Beginner"]?.length || 0,
  },
]);

const filteredSkills = computed(() => {
  switch (activeFilter.value) {
    case "expert":
      return skillsByLevel.value["Expert"] || [];
    case "advanced":
      return skillsByLevel.value["Advanced"] || [];
    case "intermediate":
      return skillsByLevel.value["Intermediate"] || [];
    case "beginner":
      return skillsByLevel.value["Beginner"] || [];
    default:
      return skills.value;
  }
});

const averageYearsExperience = computed(() => {
  const skillsWithExperience = skills.value.filter(
    (skill) => skill.yearsOfExperience && skill.yearsOfExperience > 0,
  );
  if (skillsWithExperience.length === 0) return 0;

  const totalYears = skillsWithExperience.reduce(
    (sum, skill) => sum + (skill.yearsOfExperience || 0),
    0,
  );
  return Math.round(totalYears / skillsWithExperience.length);
});

// Methods
function skillLevelToNumber(level: SkillLevel): number {
  const map: Record<SkillLevel, number> = {
    Beginner: 1,
    Intermediate: 2,
    Advanced: 3,
    Expert: 4,
  };
  return map[level] || 0;
}

function getSkillLevelLabel(level: SkillLevel): string {
  const labels: Record<SkillLevel, string> = {
    Beginner: "初學",
    Intermediate: "中級",
    Advanced: "進階",
    Expert: "專家",
  };
  return labels[level] || level;
}

function getSkillLevelBadgeClass(level: SkillLevel): string {
  const baseClasses =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  const levelClasses: Record<SkillLevel, string> = {
    Beginner: "bg-gray-100 text-gray-800",
    Intermediate: "bg-blue-100 text-blue-800",
    Advanced: "bg-green-100 text-green-800",
    Expert: "bg-purple-100 text-purple-800",
  };
  return `${baseClasses} ${levelClasses[level] || levelClasses["Beginner"]}`;
}

function getSkillLevelBarClass(level: SkillLevel): string {
  const classes: Record<SkillLevel, string> = {
    Beginner: "bg-gray-400",
    Intermediate: "bg-blue-500",
    Advanced: "bg-green-500",
    Expert: "bg-purple-500",
  };
  return classes[level] || classes["Beginner"];
}

function getSkillLevelDotClass(level: SkillLevel): string {
  const classes: Record<SkillLevel, string> = {
    Beginner: "bg-gray-400",
    Intermediate: "bg-blue-500",
    Advanced: "bg-green-500",
    Expert: "bg-purple-500",
  };
  return classes[level] || classes["Beginner"];
}

function getSkillLevelColorClass(level: SkillLevel): string {
  const classes: Record<SkillLevel, string> = {
    Beginner: "text-gray-400",
    Intermediate: "text-blue-500",
    Advanced: "text-green-500",
    Expert: "text-purple-500",
  };
  return classes[level] || classes["Beginner"];
}

// Lifecycle
onMounted(async () => {
  try {
    await skillStore.fetchSkills();
  } catch (error) {
    console.error("Failed to load skills:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.skill-category-card {
  @apply hover:shadow-md transition-shadow duration-200;
}

.skill-item {
  @apply pb-4 border-b border-gray-100 last:border-b-0 last:pb-0;
}

.skill-card {
  @apply hover:shadow-lg hover:-translate-y-1 transition-all duration-200;
}
</style>
