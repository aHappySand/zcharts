import { Vue, isCn } from 'examples/config';
import {
	Button,
	Select,
	Option,
	DatePicker,
	Table,
	TableColumn,
	Pagination,
	Loading,
	Dialog,
	Checkbox,
	CheckboxGroup,
	Message,
	Input,
	Dropdown,
	DropdownMenu,
	DropdownItem,
	Menu,
	Submenu,
	MenuItem,
	Tabs,
	TabPane,
	Form,
	FormItem,
	RadioGroup,
	Radio,
	Divider,
	MessageBox,
	Tooltip,
	Breadcrumb,
	BreadcrumbItem,
	Upload,
	Tree,
	InputNumber,
	Popconfirm,
	Link,
	Cascader,
	ColorPicker,
	Container,
	Tag,
	Row,
	Col,
} from 'element-ui';
import enLocale from 'element-ui/lib/locale/lang/en';
import zhLocale from 'element-ui/lib/locale/lang/zh-CN';
import locale from 'element-ui/lib/locale';

locale.use(isCn ? zhLocale : enLocale);

Vue.prototype.$ELEMENT = { size: 'mini' };
Vue.prototype.$message = Message;
Vue.prototype.$msgbox = MessageBox;
Vue.prototype.$alert = MessageBox.alert;
Vue.prototype.$confirm = MessageBox.confirm;
Vue.prototype.$prompt = MessageBox.prompt;
Vue.use(Loading.directive);

Dialog.props.closeOnClickModal.default = false;
Dialog.props.closeOnPressEscape.default = false;

const components = [
	Button,
	Select,
	Option,
	DatePicker,
	Table,
	TableColumn,
	Pagination,
	Dialog,
	Checkbox,
	CheckboxGroup,
	Input,
	Dropdown,
	DropdownMenu,
	DropdownItem,
	Menu,
	Submenu,
	MenuItem,
	Tabs,
	TabPane,
	Form,
	FormItem,
	RadioGroup,
	Radio,
	Divider,
	Tooltip,
	Breadcrumb,
	BreadcrumbItem,
	Upload,
	Tree,
	InputNumber,
	Popconfirm,
	Link,
	Cascader,
	ColorPicker,
	Container,
	Tag,
	Row,
	Col,
];

components.forEach((component) => {
	Vue.use(component);
});

export const message = Message;
