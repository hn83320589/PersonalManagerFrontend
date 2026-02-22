<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <section class="bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
            與我聯繫
          </h1>
          <p class="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            我隨時歡迎新的機會、合作提案，或是單純的交流對話。讓我們保持聯繫！
          </p>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <!-- Contact Form -->
        <div>
          <BaseCard title="傳送訊息" class="h-fit">
            <BaseForm @submit="handleSubmit">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BaseInput
                  v-model="form.firstName"
                  label="名字 *"
                  placeholder="請輸入名字"
                  required
                />
                <BaseInput
                  v-model="form.lastName"
                  label="姓氏 *"
                  placeholder="請輸入姓氏"
                  required
                />
              </div>

              <BaseInput
                v-model="form.email"
                type="email"
                label="電子信箱 *"
                placeholder="john.doe@example.com"
                required
              />

              <BaseInput
                v-model="form.company"
                label="公司 / 組織"
                placeholder="您的公司名稱"
              />

              <BaseSelect
                v-model="form.subject"
                label="主題 *"
                placeholder="請選擇主題"
                :options="subjectOptions"
                required
              />

              <BaseInput
                v-model="form.budget"
                label="專案預算（選填）"
                placeholder="例如：NT$ 50,000 - NT$ 100,000"
              />

              <BaseTextarea
                v-model="form.message"
                label="訊息內容 *"
                placeholder="請告訴我您的專案、問題，或我可以如何幫助您..."
                :rows="6"
                required
              />

              <div class="space-y-4">
                <div class="flex items-center space-x-2">
                  <input
                    id="updates"
                    v-model="form.subscribe"
                    type="checkbox"
                    class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label for="updates" class="text-sm text-gray-700">
                    訂閱我的工作與新專案更新
                  </label>
                </div>

                <div class="flex items-center space-x-2">
                  <input
                    id="privacy"
                    v-model="form.privacy"
                    type="checkbox"
                    class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    required
                  />
                  <label for="privacy" class="text-sm text-gray-700">
                    我同意<a
                      href="#"
                      class="text-primary-600 hover:text-primary-500"
                      >隱私權政策</a
                    >
                    *
                  </label>
                </div>
              </div>

              <div class="flex items-center justify-between pt-4">
                <p class="text-sm text-gray-500">* 必填欄位</p>
                <BaseButton
                  type="submit"
                  :loading="isSubmitting"
                  :disabled="!isFormValid"
                >
                  傳送訊息
                </BaseButton>
              </div>
            </BaseForm>
          </BaseCard>
        </div>

        <!-- Contact Information -->
        <div class="space-y-8">
          <!-- Contact Methods -->
          <BaseCard title="聯絡資訊">
            <div class="space-y-6">
              <div
                v-for="method in contactMethods"
                :key="method.id"
                class="flex items-start space-x-4"
              >
                <div :class="['p-3 rounded-lg', method.color]">
                  <component :is="method.icon" class="w-6 h-6" />
                </div>
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-900">{{ method.type }}</h3>
                  <p class="text-gray-600 mt-1">{{ method.description }}</p>
                  <div class="mt-2">
                    <a
                      v-if="method.type === 'Email'"
                      :href="`mailto:${method.value}`"
                      class="inline-flex items-center text-primary-600 hover:text-primary-500 transition-colors"
                    >
                      {{ method.value }}
                      <ArrowTopRightOnSquareIcon class="w-4 h-4 ml-1" />
                    </a>
                    <a
                      v-else-if="method.type === 'Phone'"
                      :href="`tel:${method.value}`"
                      class="inline-flex items-center text-primary-600 hover:text-primary-500 transition-colors"
                    >
                      {{ method.value }}
                      <ArrowTopRightOnSquareIcon class="w-4 h-4 ml-1" />
                    </a>
                    <a
                      v-else
                      :href="method.value"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center text-primary-600 hover:text-primary-500 transition-colors"
                    >
                      {{ method.label || method.value }}
                      <ArrowTopRightOnSquareIcon class="w-4 h-4 ml-1" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </BaseCard>

          <!-- Social Media -->
          <BaseCard title="追蹤我">
            <div class="grid grid-cols-2 gap-4">
              <a
                v-for="social in socialLinks"
                :key="social.name"
                :href="social.url"
                target="_blank"
                rel="noopener noreferrer"
                :class="[
                  'flex items-center justify-center p-4 rounded-lg border-2 border-gray-200 hover:border-primary-300 transition-colors group',
                  social.color,
                ]"
              >
                <component :is="social.icon" class="w-6 h-6 mr-3" />
                <span class="font-medium">{{ social.name }}</span>
              </a>
            </div>
          </BaseCard>

          <!-- Quick Contact -->
          <BaseCard title="快速聯繫">
            <div class="space-y-4">
              <div
                class="bg-primary-50 border border-primary-200 rounded-lg p-4"
              >
                <div class="flex items-center space-x-3">
                  <ClockIcon class="w-5 h-5 text-primary-600" />
                  <div>
                    <h4 class="font-medium text-primary-900">回覆時間</h4>
                    <p class="text-sm text-primary-700">通常在 24 小時內</p>
                  </div>
                </div>
              </div>

              <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                <div class="flex items-center space-x-3">
                  <CheckCircleIcon class="w-5 h-5 text-green-600" />
                  <div>
                    <h4 class="font-medium text-green-900">目前可接案</h4>
                    <p class="text-sm text-green-700">歡迎新專案合作</p>
                  </div>
                </div>
              </div>

              <div class="space-y-2">
                <BaseButton
                  variant="outline"
                  class="w-full"
                  @click="scrollToForm"
                >
                  <PaperAirplaneIcon class="w-4 h-4 mr-2" />
                  快速傳訊
                </BaseButton>

                <BaseButton
                  variant="outline"
                  class="w-full"
                  @click="downloadResume"
                >
                  <DocumentArrowDownIcon class="w-4 h-4 mr-2" />
                  下載履歷
                </BaseButton>
              </div>
            </div>
          </BaseCard>

          <!-- FAQ -->
          <BaseCard title="常見問題">
            <div class="space-y-4">
              <div
                v-for="(faq, index) in faqs"
                :key="index"
                class="border-b border-gray-200 last:border-b-0 pb-4 last:pb-0"
              >
                <button
                  @click="toggleFaq(index)"
                  class="flex items-start justify-between w-full text-left"
                >
                  <h4 class="font-medium text-gray-900 pr-4">
                    {{ faq.question }}
                  </h4>
                  <ChevronDownIcon
                    :class="[
                      'w-5 h-5 text-gray-500 transition-transform flex-shrink-0',
                      openFaq === index ? 'transform rotate-180' : '',
                    ]"
                  />
                </button>
                <div
                  v-if="openFaq === index"
                  class="mt-2 text-sm text-gray-600"
                >
                  {{ faq.answer }}
                </div>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>
    </section>

    <!-- Success Modal -->
    <BaseModal
      v-model:show="showSuccessModal"
      title="訊息已送出！"
      size="medium"
    >
      <div class="text-center py-4">
        <CheckCircleIcon class="mx-auto h-16 w-16 text-green-500 mb-4" />
        <p class="text-gray-700 mb-4">
          感謝您的來訊！我已收到您的訊息，將會儘快回覆。
        </p>
        <p class="text-sm text-gray-500">通常會在工作日 24 小時內回覆。</p>
      </div>
      <template #footer>
        <div class="flex space-x-3">
          <BaseButton variant="outline" @click="showSuccessModal = false">
            繼續瀏覽
          </BaseButton>
          <BaseButton variant="primary" @click="router.push('/blog')">
            查看我的部落格
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from "vue";
import { useRouter } from "vue-router";
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowTopRightOnSquareIcon,
  PaperAirplaneIcon,
  DocumentArrowDownIcon,
  ChevronDownIcon,
} from "@heroicons/vue/24/outline";
import {
  ChatBubbleLeftRightIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  HeartIcon,
} from "@heroicons/vue/24/solid";
import BaseCard from "@/components/ui/BaseCard.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import BaseInput from "@/components/ui/BaseInput.vue";
import BaseTextarea from "@/components/ui/BaseTextarea.vue";
import BaseSelect from "@/components/ui/BaseSelect.vue";
import BaseForm from "@/components/ui/BaseForm.vue";
import BaseModal from "@/components/ui/BaseModal.vue";

// Router
const router = useRouter();

// State
const isSubmitting = ref(false);
const showSuccessModal = ref(false);
const openFaq = ref<number | null>(null);

const form = reactive({
  firstName: "",
  lastName: "",
  email: "",
  company: "",
  subject: "",
  budget: "",
  message: "",
  subscribe: false,
  privacy: false,
});

// Computed
const isFormValid = computed(() => {
  return (
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.email.trim() &&
    form.subject &&
    form.message.trim() &&
    form.privacy
  );
});

// Data
const subjectOptions = [
  { label: "網站開發專案", value: "web-development" },
  { label: "行動 App 開發", value: "mobile-development" },
  { label: "UI/UX 設計", value: "ui-ux-design" },
  { label: "諮詢與策略", value: "consulting" },
  { label: "技術支援", value: "technical-support" },
  { label: "演講邀約", value: "speaking" },
  { label: "合作機會", value: "partnership" },
  { label: "工作機會", value: "job" },
  { label: "一般詢問", value: "general" },
  { label: "其他", value: "other" },
];

const contactMethods = [
  {
    id: 1,
    type: "Email",
    icon: EnvelopeIcon,
    value: "contact@example.com",
    description: "適合詳細詢問和專案討論",
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: 2,
    type: "Phone",
    icon: PhoneIcon,
    value: "+1 (555) 123-4567",
    description: "適合緊急事務或快速諮詢",
    color: "bg-green-100 text-green-600",
  },
  {
    id: 3,
    type: "Location",
    icon: MapPinIcon,
    value: "San Francisco, CA",
    description: "可進行當面會議和駐點專案",
    color: "bg-purple-100 text-purple-600",
  },
  {
    id: 4,
    type: "LinkedIn",
    icon: BriefcaseIcon,
    value: "https://linkedin.com/in/yourprofile",
    label: "專業人脈",
    description: "聯繫專業人脈網絡",
    color: "bg-blue-100 text-blue-600",
  },
];

const socialLinks = [
  {
    name: "GitHub",
    url: "https://github.com/yourusername",
    icon: AcademicCapIcon,
    color: "hover:bg-gray-50",
  },
  {
    name: "LinkedIn",
    url: "https://linkedin.com/in/yourprofile",
    icon: BriefcaseIcon,
    color: "hover:bg-blue-50",
  },
  {
    name: "Twitter",
    url: "https://twitter.com/yourusername",
    icon: ChatBubbleLeftRightIcon,
    color: "hover:bg-blue-50",
  },
  {
    name: "作品集",
    url: "/portfolio",
    icon: HeartIcon,
    color: "hover:bg-primary-50",
  },
];

const faqs = [
  {
    question: "您接受哪些類型的專案？",
    answer:
      "我專長網站開發、行動應用程式和 UI/UX 設計。無論是新創公司或成熟企業，從簡單的網站到複雜的網路應用程式，我都能提供協助。",
  },
  {
    question: "專案一般需要多久完成？",
    answer:
      "專案時間取決於範圍和複雜度。簡單網站約 2-4 週，複雜應用可能需要 3-6 個月。在初次諮詢時，我會提供詳細的時間規劃。",
  },
  {
    question: "您接受海外客戶嗎？",
    answer:
      "是的！我與全球客戶合作。我擅長遠端協作，並有跨時區工作的豐富經驗。",
  },
  {
    question: "您的計價方式是什麼？",
    answer:
      "根據專案範圍，我提供專案制和時薪制兩種計價方式。在瞭解您的需求後，我會提供詳細報價。歡迎在聯繫表單中提及您的預算。",
  },
  {
    question: "您提供後續支援嗎？",
    answer:
      "是的，我提供所有專案的維護和支援套件。包括錯誤修正、更新和功能增強等服務。",
  },
];

// Methods
async function handleSubmit() {
  if (!isFormValid.value || isSubmitting.value) return;

  try {
    isSubmitting.value = true;

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // In a real app, you'd call an API here
    console.log("Form submitted:", form);

    // Reset form
    Object.assign(form, {
      firstName: "",
      lastName: "",
      email: "",
      company: "",
      subject: "",
      budget: "",
      message: "",
      subscribe: false,
      privacy: false,
    });

    showSuccessModal.value = true;
  } catch (error) {
    console.error("Failed to submit form:", error);
    // In a real app, you'd show an error toast
  } finally {
    isSubmitting.value = false;
  }
}

function scrollToForm() {
  const formElement = document.querySelector("form");
  if (formElement) {
    formElement.scrollIntoView({ behavior: "smooth" });
  }
}

function downloadResume() {
  // In a real app, this would download the actual resume file
  console.log("Downloading resume...");

  // Simulate download
  const link = document.createElement("a");
  link.href = "/resume.pdf"; // This would be a real file path
  link.download = "resume.pdf";
  link.click();
}

function toggleFaq(index: number) {
  openFaq.value = openFaq.value === index ? null : index;
}
</script>

<style scoped>
/* Custom styles if needed */
</style>
