import React, {Component} from 'react';
import {
	Modal, 
	Text, 
	TouchableHighlight, 
	View, 
	StyleSheet, 
	Dimensions,
	ScrollView,
	TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import { Item, Icon, Input, Button } from 'native-base';

const {width, height} = Dimensions.get('window');
const modalViewHeight = height*7/10;
const modalViewWidth = width*8/10 > 275 ? 275 : width*8/10;
const modalHeaderHeight = 40; //change it to 50 if you want to add header
const modalFooterHeight = 50;
const modalContentHeight = modalViewHeight - modalHeaderHeight - modalFooterHeight;
const modalMarginTop = (height - modalViewHeight) / 2;


class MultiSelect extends Component {
	constructor(props){
		super(props);
		const modalVisible = this.props.visible == null | false | 'undefined' ? false : true;
		this.state = {
			inputRef: null,
			modalVisible,
			items: [], //array of objects each containing an id
			value:[],//ids only stored here
			valueCode:[],//holdes the codes for the selected 
			valueCodeString: '',
			isCorrect: 0,
			errorMessage: '',
			prestine: true
		};
	}

	checkIfIsCorrect = () => {
		if(this.state.value.length > 0){
			this.state.isCorrect = 1;
			this.state.errorMessage = '';
		}else{
			this.state.isCorrect = 2;
			this.state.errorMessage = 'At least one language must be choosen';
		}

		this.setState(this.state);
		this.props.update();
	}

	clearInput(){
		this.setState({isCorrect: 0, value: [],valueCode:[],valueCodeString:''});
	}
	componentWillReceiveProps(){
		const modalVisible = this.props.visible == null | false | 'undefined' ? false : true;
		this.setState({items: this.props.items});
	}

	setModalVisible(visible) {
		if(this.state.prestine && visible)this.state.prestine = false;
		if(!this.state.prestine && !visible){
			this.checkIfIsCorrect();
		}
		
		this.setState({modalVisible: visible});
	}

	loadItems(items) {
		this.setState({items});
	}

	itemSelected(id, code){
		console.log(code)
		var selectedItems = this.state.value;
		var valueCode = this.state.valueCode;
		const index = selectedItems.indexOf(id);
		const indexValueCode = valueCode.indexOf(code);

		if(index == -1){//either index or indexValueCode can work here
			selectedItems.push(id);
			valueCode.push(code);
		}else{
			selectedItems.splice(index, 1);
			valueCode.splice(indexValueCode, 1);
		}

		console.log(selectedItems)
		console.log(valueCode)
		this.checkIfIsCorrect();
		//to show the value to user
		this.setState({value: selectedItems, valueCode, valueCodeString: valueCode.join(', ')});
		this.props.update();
	}

	checkIfSelected(id){
		//you can choose 1 and 0 to work with opacity as well as active props if there are any
		return this.state.value.indexOf(id) == -1 ? 0 : 1;
	}

	setSelectedItems(items) {
		items.forEach(item => {
			this.itemSelected(item.id, item.code)
		})
	}

	renderList() {
		const items = this.state.items;
		return (
		  <View>
			{Object.values(items).map((obj, index) =>
				<TouchableOpacity 
					key={obj.id} 
					style={styles.row} 
					onPress={()=>{this.itemSelected(obj.id,obj.code)}}>
					<Icon
						name="md-checkmark"
						style={[styles.indicator,{opacity: this.checkIfSelected(obj.id)}]}
					/>
					<View style={styles.rowContent}>
						<Text style={{paddingLeft: 20, fontSize: 16, color: '#888'}}>
							{obj.name}
						</Text>
					</View>
				</TouchableOpacity>
			)}
		  </View>
		);
	}


  	render() {
    	return (
		<View style={styles.container}>
			<Modal
			animationType="slide"
			transparent={true}
			visible={this.state.modalVisible}
			style={styles.modal}
			onRequestClose={() => this.setModalVisible(false)}>
				<View style={styles.modalContainer}>
				</View>
				<View style={styles.modalView}>
					{/* HEADER SECTION */}
					<View style={styles.modalHeader}>
						<TouchableOpacity onPress={() => this.setModalVisible(false)}>
							<Icon
								name="md-close"
								style={{padding: 15, color: '#fff'}}
							/>
						</TouchableOpacity>
					</View>

					{/* CONTENT SECTION */}
					<View style={styles.modalContent}>
						<ScrollView style={{flex: 1}}>
							{this.renderList()}
						</ScrollView>
					</View>

					{/* FOOTER SECTION */}
					<View style={styles.modalFooter}>
						<View style={styles.actions}>
							<TouchableOpacity
								onPress={() => this.setModalVisible(false)}
								style={[styles.actionButton,styles.primary]}>
								<Text style={[styles.centerText, {color: '#fff'}]}>Submit</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
				<View
					style={{
						marginTop: this.props.special ? height / 350 : 0,
					}}>
				<Item  
					style={{
						width: this.props.full ? width - 30 : (width * 7) / 10, 
						borderBottomColor: mainThemeColor 
					}}
					onPress={() => this.setModalVisible(true)}>
					<Icon
					name="md-globe"
					style={{
						color: this.props.full ? "#333" : mainThemeColor, fontSize: GLOBAL.totalSize(2.61), marginLeft: width / 200,
					}}
					/>
					<Input
						{...(this.props.full ? GLOBAL.inputTextStyleBlack : GLOBAL.inputTextStyle)}
						blurOnSubmit={false}
						returnKeyType="next"
						ref={(ref) => { this.state.inputRef = ref; }}
						editable={false}
						autoCapitalize="sentences"
						placeholder={'Languages'}
						onSubmitEditing={this.props.changeFocus}
						value={this.state.valueCodeString}
					/>
					{GLOBAL.checkMarksArray[this.state.isCorrect]}
				</Item>
				<View style={{marginLeft: 15,marginTop: 2}}>
					<Text style={{color: '#e71a64',fontSize: 12}}>
						{this.state.errorMessage}
					</Text>
				</View>
			</View>
		</View>
    	);
  	}
}


const styles = StyleSheet.create({
  container:{
  },
  modal:{
	flex: 1,
  },
  modalBackground:{
	position: 'absolute',
    flexDirection: 'column',
    backgroundColor: '#fff',
    width: width,
	height: height,
	opacity: 1,
	zIndex: 99
  },
  modalView:{
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    width: (width * 7) / 10 + 5,
    height: modalViewHeight,
    marginTop: modalMarginTop,
	borderRadius: 3,
	alignSelf: 'center',
	overflow: 'hidden',
	zIndex: 3
  },
  modalHeader:{
    backgroundColor: '#117bca',
	height: modalHeaderHeight,
	flexDirection: 'row',
	justifyContent: 'flex-end',
	alignItems: 'center',
	alignContent:'center'
  },
  modalContent:{
    backgroundColor: '#fff',
    height: modalContentHeight
  },
  modalFooter:{
    backgroundColor: '#fff',
    height: modalFooterHeight,
  },
  actions:{
	  flexDirection: 'row',
	  justifyContent: 'center',
	  alignContent: 'stretch',
	  alignItems: 'stretch'
  },
  actionButton:{
	height: modalFooterHeight,
	width: modalViewWidth,
	flexDirection: 'column',
	justifyContent: 'center',
  },
  primary:{
	backgroundColor: '#117bca',
  },
  danger:{
	backgroundColor: '#ff0'
  },
  centerText:{
	textAlign: 'center',
  },
  row:{
	flexDirection: 'row',
	justifyContent: 'flex-start',
	padding: 15,
	borderColor: '#eee',
	borderBottomWidth: 1
  },
  indicator:{
	color: '#ccc',
	fontSize: GLOBAL.totalSize(2.61), 
	paddingRight: 10,
  },
  rowContent:{
	  width: 100,
  },
});

MultiSelect.propTypes = {
  full: PropTypes.bool
};

MultiSelect.defaultProps = {
  full: false
};

export default MultiSelect;