<template>
  <view class="page">
    <view class="form">
      <view class="form-item form-item-row">
        <text class="label">头像</text>
        <AvatarUploader v-model="form.avatar" />
      </view>

      <view class="form-item">
        <text class="label">名字 *</text>
        <input class="input" v-model="form.name" placeholder="请输入宠物名字" maxlength="20" />
      </view>

      <view class="form-item">
        <text class="label">类型 *</text>
        <view class="radio-group">
          <view
            v-for="t in TYPES"
            :key="t.value"
            class="radio-item"
            :class="{ active: form.type === t.value }"
            @tap="onTypeChange(t.value)"
          >
            <text>{{ t.label }}</text>
          </view>
        </view>
      </view>

      <view class="form-item">
        <text class="label">品种</text>
        <picker :range="breeds" :value="breedIndex" @change="onBreedChange">
          <view class="picker">{{ form.breed || '请选择品种' }}</view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">性别</text>
        <view class="radio-group">
          <view
            v-for="g in GENDERS"
            :key="g.value"
            class="radio-item"
            :class="{ active: form.gender === g.value }"
            @tap="form.gender = g.value"
          >
            <text>{{ g.label }}</text>
          </view>
        </view>
      </view>

      <view class="form-item">
        <text class="label">生日</text>
        <picker mode="date" :value="form.birthday" @change="onBirthdayChange">
          <view class="picker">{{ form.birthday || '请选择' }}</view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">体重(kg)</text>
        <input
          class="input"
          v-model="weightStr"
          placeholder="可选"
          type="digit"
        />
      </view>

      <view class="form-item">
        <text class="label">备注</text>
        <textarea
          class="textarea"
          v-model="form.note"
          placeholder="可填写性格、习惯等（200 字内）"
          maxlength="200"
        />
      </view>
    </view>

    <button class="save-btn" :disabled="saving" @tap="handleSave">
      {{ saving ? '保存中...' : '保存' }}
    </button>
    <button v-if="petId" class="delete-btn" :disabled="saving" @tap="handleDelete">
      删除宠物
    </button>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref, watch, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AvatarUploader from '../../components/AvatarUploader.vue';
import {
  createPet,
  deletePet,
  getPet,
  listBreeds,
  updatePet,
  type PetGender,
  type PetType,
} from '../../api/pet';

const TYPES: { value: PetType; label: string }[] = [
  { value: 'CAT', label: '猫' },
  { value: 'DOG', label: '狗' },
  { value: 'OTHER', label: '其他' },
];

const GENDERS: { value: PetGender; label: string }[] = [
  { value: 'MALE', label: '公' },
  { value: 'FEMALE', label: '母' },
  { value: 'UNKNOWN', label: '未知' },
];

const petId = ref('');
const saving = ref(false);
const breeds = ref<string[]>([]);
const weightStr = ref('');

const form = reactive({
  name: '',
  type: 'CAT' as PetType,
  breed: '',
  gender: 'UNKNOWN' as PetGender,
  birthday: '',
  avatar: '',
  note: '',
});

const breedIndex = computed(() =>
  Math.max(0, breeds.value.indexOf(form.breed)),
);

onLoad(async (options: any) => {
  await loadBreeds(form.type);
  if (options?.id) {
    petId.value = options.id;
    const pet = await getPet(options.id);
    form.name = pet.name;
    form.type = pet.type;
    form.breed = pet.breed || '';
    form.gender = pet.gender;
    form.birthday = pet.birthday ? pet.birthday.slice(0, 10) : '';
    form.avatar = pet.avatar || '';
    form.note = pet.note || '';
    weightStr.value = pet.weight !== null ? String(pet.weight) : '';
    await loadBreeds(pet.type);
  }
});

async function loadBreeds(type: PetType) {
  try {
    breeds.value = await listBreeds(type);
  } catch {
    breeds.value = [];
  }
}

async function onTypeChange(t: PetType) {
  form.type = t;
  form.breed = '';
  await loadBreeds(t);
}

function onBreedChange(e: any) {
  form.breed = breeds.value[e.detail.value] || '';
}

function onBirthdayChange(e: any) {
  form.birthday = e.detail.value;
}

async function handleSave() {
  if (!form.name.trim()) {
    uni.showToast({ title: '请填写名字', icon: 'none' });
    return;
  }

  saving.value = true;
  const payload = {
    name: form.name.trim(),
    type: form.type,
    breed: form.breed || undefined,
    gender: form.gender,
    birthday: form.birthday || undefined,
    weight: weightStr.value ? Number(weightStr.value) : undefined,
    avatar: form.avatar || undefined,
    note: form.note.trim() || undefined,
  };

  try {
    if (petId.value) {
      await updatePet(petId.value, payload);
    } else {
      await createPet(payload);
    }
    uni.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => uni.navigateBack(), 800);
  } catch {
    // already toasted
  } finally {
    saving.value = false;
  }
}

function handleDelete() {
  uni.showModal({
    title: '确认删除',
    content: '删除后无法恢复',
    success: async (res) => {
      if (!res.confirm) return;
      try {
        await deletePet(petId.value);
        uni.showToast({ title: '已删除', icon: 'success' });
        setTimeout(() => uni.navigateBack(), 800);
      } catch {
        // already toasted
      }
    },
  });
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f8f8f8;
  padding: 24rpx;
}
.form {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}
.form-item {
  margin-bottom: 32rpx;
}
.form-item:last-child {
  margin-bottom: 0;
}
.form-item-row {
  display: flex;
  align-items: center;
  gap: 24rpx;
}
.label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
}
.input {
  width: 100%;
  height: 72rpx;
  border: 2rpx solid #eee;
  border-radius: 12rpx;
  padding: 0 16rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}
.textarea {
  width: 100%;
  height: 160rpx;
  border: 2rpx solid #eee;
  border-radius: 12rpx;
  padding: 16rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}
.picker {
  height: 72rpx;
  line-height: 72rpx;
  padding: 0 16rpx;
  border: 2rpx solid #eee;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
}
.radio-group {
  display: flex;
  gap: 16rpx;
}
.radio-item {
  flex: 1;
  text-align: center;
  height: 64rpx;
  line-height: 64rpx;
  border: 2rpx solid #eee;
  border-radius: 32rpx;
  font-size: 26rpx;
  color: #666;
}
.radio-item.active {
  background: #fff3ea;
  border-color: #ff8a47;
  color: #ff8a47;
}
.save-btn {
  margin-top: 32rpx;
  width: 100%;
  background: #ff8a47;
  color: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;
  line-height: 88rpx;
}
.save-btn[disabled] {
  opacity: 0.6;
}
.delete-btn {
  margin-top: 16rpx;
  width: 100%;
  background: #fff;
  color: #e64340;
  border: 2rpx solid #e64340;
  border-radius: 44rpx;
  font-size: 30rpx;
  line-height: 84rpx;
}
</style>
