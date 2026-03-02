import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, InputNumber, Button, message, Typography, Space } from 'antd';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import './App.css';

const { Text } = Typography;

interface FormValues {
  studioName: string;
  ipName: string;
  roleName: string;
  productName: string;
  scale: number;
  height: number;
  depth: number;
  width: number;
  limitedCount: number;
  estimatedTime: string;
}

function App() {
  const [form] = Form.useForm<FormValues>();
  const [generatedTitle, setGeneratedTitle] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState<string>('');

  // 处理Input组件的空格逻辑
  const handleInputChange = (value: string) => {
    if (!value) return value;
    // 去除开头和结尾的空格、制表符、换行符
    let processedValue = value.trim();
    // 将多个连续空格改为1个空格
    processedValue = processedValue.replace(/\s+/g, ' ');
    return processedValue;
  };

  // 角色名称变化时自动赋值到商品名称
  const handleRoleNameChange = (value: string) => {
    const processedValue = handleInputChange(value);
    form.setFieldsValue({ productName: processedValue });
    return processedValue;
  };

  // 组装标题
  const generateTitle = (values: FormValues) => {
    let title = '(Shipping Included)';
    title += values.studioName + ' - ';
    title += values.ipName + ' - ';
    title += values.productName + ' ';
    if (values.scale) {
      title += `1/${values.scale} `;
    }
    title += 'Statue';
    return title;
  };

  // 组装详情内容
  const generateContent = (values: FormValues) => {
    let content = '';
    content += `<strong>Studio:</strong> ${values.studioName || '--'}\n`;
    content += `<strong>Product Name:</strong> ${values.productName || '--'}\n`;
    content += `<strong>Est. Completion:</strong> ${values.estimatedTime || '--'}\n`;
    // 检查H、D、W是否都有值
    if (values.height !== undefined && values.height !== null && values.depth !== undefined && values.depth !== null && values.width !== undefined && values.width !== null) {
      content += `<strong>Size:</strong> (H) ${values.height}cm x (D) ${values.depth}cm x (W) ${values.width}cm\n`;
    } else {
      content += `<strong>Size:</strong> --\n`;
    }
    content += `<strong>Limited No Of Unit:</strong> ${values.limitedCount || '--'}\n`;
    content += `<strong>Product IP:</strong> ${values.ipName || '--'}\n`;
    content += `<strong>Product Role:</strong> ${values.roleName || '--'}\n`;
    content += `<strong>Product Scale:</strong> ${values.scale ? `1/${values.scale}` : '--'}\n`;
    content += `<strong>Product Material:</strong> Imported resin and PU\n`;
    content += `<strong>Special Description:</strong> --`;
    return content;
  };

  // 复制到剪贴板
  const copyToClipboard = () => {
    if (generatedTitle) {
      navigator.clipboard.writeText(generatedTitle)
        .then(() => {
          message.success('标题已复制到剪贴板');
        })
        .catch(() => {
          message.error('复制失败');
        });
    }
  };

  // 表单提交
  const handleSubmit = (values: FormValues) => {
    const title = generateTitle(values);
    const content = generateContent(values);
    setGeneratedTitle(title);
    setGeneratedContent(content);
  };

  return (
    <div className="app">
      <h1>商品信息生成器</h1>
      
      <div className="container">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="form"
        >
          <div className="form-row">
            <Form.Item
              label="工作室名称"
              name="studioName"
              rules={[{ required: true, message: '请输入工作室名称' }]}
            >
              <Input onChange={(e) => e.target.value = handleInputChange(e.target.value)} />
            </Form.Item>

            <Form.Item
              label="IP名称"
              name="ipName"
              rules={[{ required: true, message: '请输入IP名称' }]}
            >
              <Input onChange={(e) => e.target.value = handleInputChange(e.target.value)} />
            </Form.Item>
          </div>

          <div className="form-row">
            <Form.Item
              label="角色名称"
              name="roleName"
              rules={[{ required: true, message: '请输入角色名称' }]}
            >
              <Input onChange={(e) => e.target.value = handleRoleNameChange(e.target.value)} />
            </Form.Item>

            <Form.Item
              label="商品名称"
              name="productName"
              rules={[{ required: true, message: '请输入商品名称' }]}
            >
              <Input onChange={(e) => e.target.value = handleInputChange(e.target.value)} />
            </Form.Item>
          </div>

          <div className="form-row">
            <Form.Item label="一比几" name="scale">
              <InputNumber min={1} />
            </Form.Item>

            <Form.Item label="限量数量" name="limitedCount">
              <InputNumber min={1} />
            </Form.Item>
          </div>

          <div className="form-row">
            <Form.Item 
              label="H(高)" 
              name="height"
              rules={[
                {
                  validator: (_, value, callback) => {
                    const depth = form.getFieldValue('depth');
                    const width = form.getFieldValue('width');
                    if ((value !== undefined && value !== null) && (depth === undefined || depth === null || width === undefined || width === null)) {
                      callback('如果填写了高度，必须同时填写深度和宽度');
                    } else {
                      callback();
                    }
                  }
                }
              ]}
            >
              <InputNumber min={0} />
            </Form.Item>

            <Form.Item 
              label="D(深)" 
              name="depth"
              rules={[
                {
                  validator: (_, value, callback) => {
                    const height = form.getFieldValue('height');
                    const width = form.getFieldValue('width');
                    if ((value !== undefined && value !== null) && (height === undefined || height === null || width === undefined || width === null)) {
                      callback('如果填写了深度，必须同时填写高度和宽度');
                    } else {
                      callback();
                    }
                  }
                }
              ]}
            >
              <InputNumber min={0} />
            </Form.Item>
          </div>

          <div className="form-row">
            <Form.Item 
              label="W(宽)" 
              name="width"
              rules={[
                {
                  validator: (_, value, callback) => {
                    const height = form.getFieldValue('height');
                    const depth = form.getFieldValue('depth');
                    if ((value !== undefined && value !== null) && (height === undefined || height === null || depth === undefined || depth === null)) {
                      callback('如果填写了宽度，必须同时填写高度和深度');
                    } else {
                      callback();
                    }
                  }
                }
              ]}
            >
              <InputNumber min={0} />
            </Form.Item>

            <Form.Item
              label="预期出货时间"
              name="estimatedTime"
              rules={[
                {
                  pattern: /^\d{4} Q[1-4]$/,
                  message: '格式应为4位年份+Q+空格+1-4，例如：2026 Q3'
                }
              ]}
            >
              <Input placeholder="例如：2026 Q3" />
            </Form.Item>
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              生成
            </Button>
          </Form.Item>
        </Form>

        <div className="result">
          {generatedTitle ? (
            <>
              <div className="title-section">
                <Text strong>{generatedTitle}</Text>
                <Button type="link" onClick={copyToClipboard}>
                  复制标题
                </Button>
              </div>
              
              <div className="content-section">
                <h3>详情</h3>
                <div className="html-content" dangerouslySetInnerHTML={{ __html: generatedContent }} />
              </div>
            </>
          ) : (
            <div className="empty-result">
              <p>填写表单并点击生成按钮查看结果</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;