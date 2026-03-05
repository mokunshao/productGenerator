import { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, message, Typography, Alert, Input as AntInput, Tooltip } from 'antd';

const { TextArea } = AntInput;
import './App.css';

const { Text } = Typography;

interface FormValues {
  studioName: string;
  ipName: string;
  roleName?: string;
  productName: string;
  scale?: number;
  height?: number;
  depth?: number;
  width?: number;
  limitedCount?: number;
  estimatedTime?: string;
}

function App() {
  // 计算当前季度的下一个季度
  const getNextQuarter = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const currentQuarter = Math.floor(month / 3) + 1;
    let nextQuarter = currentQuarter + 1;
    let nextYear = year;
    if (nextQuarter > 4) {
      nextQuarter = 1;
      nextYear += 1;
    }
    return `${nextYear} Q${nextQuarter}`;
  };

  const [form] = Form.useForm<FormValues>();

  // 设置表单初始值
  useEffect(() => {
    form.setFieldsValue({
      estimatedTime: getNextQuarter()
    });
  }, [form]);
  const [generatedTitle, setGeneratedTitle] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [showRoleWarning, setShowRoleWarning] = useState<boolean>(false);
  const [jsonInput, setJsonInput] = useState<string>('');

  // 处理Input组件的空格逻辑
  const handleInputChange = (value: string | undefined | null) => {
    if (!value) return '';
    // 去除开头和结尾的空格、制表符、换行符
    let processedValue = value.trim();
    // 将多个连续空格改为1个空格
    processedValue = processedValue.replace(/\s+/g, ' ');
    return processedValue;
  };

  // 点击按钮后将角色名称赋值到商品名称
  const syncRoleToProduct = () => {
    const roleName = form.getFieldValue('roleName');
    if (roleName) {
      const processedValue = handleInputChange(roleName);
      form.setFieldsValue({ productName: processedValue });
    }
  };

  // 从JSON导入数据
  const importFromJson = () => {
    if (!jsonInput.trim()) {
      message.error('请输入JSON数据');
      return;
    }

    try {
      // 尝试解析JSON
      const data = JSON.parse(jsonInput);

      // 检查数据结构是否正确
      if (typeof data === 'object' && data !== null) {
        // 回填到表单
        form.setFieldsValue(data);

        // 生成标题和详情
        handleSubmit(data as FormValues);

        message.success('从JSON导入成功');
      } else {
        message.error('JSON数据格式不正确');
      }
    } catch (error) {
      message.error('JSON解析失败，请检查输入格式');
    }
  };

  // 组装标题
  const generateTitle = (values: FormValues) => {
    let title = '(Shipping Included)';
    title += handleInputChange(values.studioName) + ' - ';
    title += handleInputChange(values.ipName) + ' - ';
    title += handleInputChange(values.productName) + ' ';
    if (values.scale) {
      title += `1/${values.scale} `;
    }
    title += 'Statue';
    return title;
  };

  // 组装详情内容
  const generateContent = (values: FormValues) => {
    // 生成Size字段
    let sizeValue = '';
    const sizeParts = [];
    if (values.height !== undefined && values.height !== null) {
      sizeParts.push(`(H) ${values.height} cm`);
    }
    if (values.depth !== undefined && values.depth !== null) {
      sizeParts.push(`(D) ${values.depth} cm`);
    }
    if (values.width !== undefined && values.width !== null) {
      sizeParts.push(`(W) ${values.width} cm`);
    }
    if (sizeParts.length > 0) {
      sizeValue = sizeParts.join(' x ');
    } else {
      sizeValue = '--';
    }

    const fields = [
      { name: 'Studio', value: handleInputChange(values.studioName) || '--' },
      { name: 'Product Name', value: handleInputChange(values.productName) || '--' },
      { name: 'Est. Completion', value: handleInputChange(values.estimatedTime) || '--' },
      { name: 'Size', value: sizeValue },
      { name: 'Limited No Of Unit', value: values.limitedCount || '--' },
      { name: 'Product IP', value: handleInputChange(values.ipName) || '--' },
      { name: 'Product Role', value: handleInputChange(values.roleName) || '--' },
      { name: 'Product Scale', value: values.scale ? `1/${values.scale}` : '--' },
      { name: 'Product Material', value: 'Imported resin and PU' },
      { name: 'Special Description', value: '--' }
    ];

    let html = '';
    fields.forEach(field => {
      if (field.value) {
        html += `<div><strong>${field.name}:</strong> ${field.value}</div>`;
      }
    });
    return html;
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
    // 检查是否有角色名称
    if (!values.roleName || values.roleName.trim() === '') {
      setShowRoleWarning(true);
    } else {
      setShowRoleWarning(false);
    }

    const title = generateTitle(values);
    const content = generateContent(values);
    setGeneratedTitle(title);
    setGeneratedContent(content);
  };

  return (
    <div className="app">
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
              <Input onChange={(e) => e.target.value = handleInputChange(e.target.value)} autoComplete="off" />
            </Form.Item>

            <Form.Item
              label="IP名称"
              name="ipName"
              rules={[{ required: true, message: '请输入IP名称' }]}
            >
              <Input onChange={(e) => e.target.value = handleInputChange(e.target.value)} autoComplete="off" />
            </Form.Item>
          </div>

          <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end' }}>
            <div className="form-row">
              <Form.Item
                label="角色名称"
                name="roleName"
              >
                <Input onChange={(e) => e.target.value = handleInputChange(e.target.value)} autoComplete="off" style={{ flex: 1 }} />
              </Form.Item>
            </div>
            <Tooltip title="将角色名称同步到商品名称">
              <Button type="link" onClick={syncRoleToProduct} size="small" style={{ marginBottom: '8px' }}>
                →
              </Button>
            </Tooltip>
            <Form.Item
              label="商品名称"
              name="productName"
              rules={[{ required: true, message: '请输入商品名称' }]}
            >
              <Input onChange={(e) => e.target.value = handleInputChange(e.target.value)} autoComplete="off" />
            </Form.Item>
          </div>

          <div className="form-row">
            <Form.Item label="一比几" name="scale">
              <InputNumber min={1} controls={false} />
            </Form.Item>

            <Form.Item label="限量数量" name="limitedCount">
              <InputNumber min={1} controls={false} />
            </Form.Item>
          </div>

          <div className="form-row">
            <Form.Item
              label="H(高)"
              name="height"
            >
              <InputNumber min={0} controls={false} />
            </Form.Item>

            <Form.Item
              label="D(深/长)"
              name="depth"
            >
              <InputNumber min={0} controls={false} />
            </Form.Item>
          </div>

          <div className="form-row">
            <Form.Item
              label="W(宽)"
              name="width"
            >
              <InputNumber min={0} controls={false} />
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
              <Input placeholder="例如：2026 Q3" autoComplete="off" />
            </Form.Item>
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              生成
            </Button>
          </Form.Item>

          {showRoleWarning && (
            <Alert
              message="警告"
              description="角色名称为空，请考虑填写角色名称以获得更完整的商品信息"
              type="warning"
              showIcon
              style={{ marginBottom: '1rem', marginTop: '1rem' }}
            />
          )}
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

          {/* JSON输入部分 */}
          <div style={{ marginTop: '2rem' }}>
            <h3>从JSON导入</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <TextArea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="请输入JSON数据或JavaScript对象"
                rows={12}
                autoComplete="off"
              />
              <Button type="default" onClick={importFromJson}>
                从JSON导入
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;