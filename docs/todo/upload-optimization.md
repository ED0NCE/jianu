# 文件上传优化 TODO

## 1. 文件上传流程优化
- [ ] 实现分步上传：先保存基本信息，文件异步上传
- [ ] 添加文件上传状态管理（uploading/completed/failed）
- [ ] 在列表页显示文件上传状态
- [ ] 实现上传失败重试机制

## 2. 文件处理优化
- [ ] 添加文件大小限制
  - 图片最大 5MB
  - 视频最大 10MB
- [ ] 添加文件类型检查
  - 图片：jpg/png/gif
  - 视频：mp4/mov
- [ ] 实现图片压缩功能
  - 大图自动压缩
  - 保持图片质量在可接受范围

## 3. 上传进度显示
- [ ] 实现文件上传进度条
- [ ] 显示每个文件的上传状态
- [ ] 显示总体上传进度

## 4. 错误处理
- [ ] 完善错误提示
- [ ] 添加网络错误重试机制
- [ ] 添加断点续传支持
- [ ] 实现上传失败后的恢复机制

## 5. 性能优化
- [ ] 实现文件分片上传
- [ ] 添加文件上传队列管理
- [ ] 优化大文件上传性能
- [ ] 添加文件上传缓存机制

## 6. 用户体验优化
- [ ] 添加上传进度提示
- [ ] 优化上传状态显示
- [ ] 添加上传失败后的重试按钮
- [ ] 优化加载状态显示

## 7. 后端接口调整
- [ ] 添加文件上传状态接口
- [ ] 添加文件上传进度接口
- [ ] 添加文件上传重试接口
- [ ] 优化文件存储机制

## 8. 测试用例
- [ ] 添加文件上传测试
- [ ] 添加错误处理测试
- [ ] 添加性能测试
- [ ] 添加用户体验测试

## 优先级
1. 文件上传流程优化（高）
2. 文件处理优化（高）
3. 错误处理（中）
4. 上传进度显示（中）
5. 性能优化（低）
6. 用户体验优化（中）
7. 后端接口调整（中）
8. 测试用例（低） 

# 文件上传优化实现 TODO

## 1. 修改表单提交逻辑
```typescript
// 1. 修改 handleSubmit 函数，实现分步上传
const handleSubmit = async () => {
  // 1.1 先保存基本信息
  const submitData = {
    ...formData,
    status: 'uploading' // 添加状态标记
  };
  const res = await saveTravelogue(submitData);
  
  // 1.2 显示成功提示并返回
  Taro.showToast({ title: '保存成功', icon: 'success' });
  Taro.navigateBack();
  
  // 1.3 后台异步上传文件
  uploadFiles(res.data.travel_id);
};

// 1.4 添加文件上传函数
const uploadFiles = async (travelId: number) => {
  // 上传图片
  for (const image of formData.images) {
    if (image.image_id === 0) {
      await uploadImage(image.image_url);
    }
  }
  
  // 上传视频
  if (formData.video_url && !formData.video_url.startsWith('http')) {
    await uploadVideo(formData.video_url);
  }
  
  // 更新状态为完成
  await updateTravelogueStatus(travelId, 'completed');
};
```

## 2. 添加文件处理函数
```typescript
// 2.1 文件大小限制
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 10 * 1024 * 1024; // 10MB

// 2.2 文件类型检查
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime'];

// 2.3 图片压缩函数
const compressImage = async (file: File) => {
  // 实现图片压缩逻辑
};
```

## 3. 添加状态管理
```typescript
// 3.1 在 store 中添加状态管理
interface TravelogueState {
  uploadStatus: Record<number, {
    status: 'uploading' | 'completed' | 'failed';
    progress: number;
  }>;
}

// 3.2 添加上传进度管理
const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
```

## 4. 修改列表页显示
```typescript
// 4.1 在列表项中显示上传状态
const TravelogueItem = ({ item }) => {
  return (
    <View className="travelogue-item">
      <Text className="title">{item.title}</Text>
      {item.status === 'uploading' && (
        <View className="upload-status">
          <View className="loading-spinner" />
          <Text>文件上传中...</Text>
        </View>
      )}
      {item.status === 'failed' && (
        <View className="upload-status error">
          <Text>上传失败</Text>
          <Button onClick={() => retryUpload(item.id)}>重试</Button>
        </View>
      )}
    </View>
  );
};
```

## 5. 添加重试机制
```typescript
// 5.1 添加重试函数
const retryUpload = async (travelId: number) => {
  // 获取未上传成功的文件
  const travelogue = await getTravelogueDetail(travelId);
  
  // 重新上传文件
  await uploadFiles(travelId);
};
```

## 6. 后端接口调整
```typescript
// 6.1 添加新的接口
interface TravelogueAPI {
  // 更新游记状态
  updateStatus: (id: number, status: string) => Promise<void>;
  
  // 更新图片
  updateImage: (id: number, imageData: any) => Promise<void>;
  
  // 更新视频
  updateVideo: (id: number, videoData: any) => Promise<void>;
}
```

## 实现顺序
1. 修改表单提交逻辑，实现分步上传
2. 添加文件处理函数，实现文件限制和压缩
3. 添加状态管理，跟踪上传进度
4. 修改列表页显示，展示上传状态
5. 添加重试机制，处理上传失败
6. 调整后端接口，支持新的上传流程 