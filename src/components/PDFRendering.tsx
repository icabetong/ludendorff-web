import { StyleSheet, View } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: '12pt',
    display: 'flex',
    flexDirection: 'column',
    fontSize: '11pt'
  },
  table: {
    margin: '12pt 0',
    display: 'flex',
    flexDirection: 'column',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
  },
  data: {
    flex: 1,
    padding: '6pt',
    border: '1px solid #efefef',
    textAlign: 'center',
    fontFamily: 'Inter',
  }
})

type TableProps = {
  children?: JSX.Element[] | JSX.Element
}
export const Table = (props: TableProps) => {
  return (
    <View style={styles.table}>
      {props.children && props.children}
    </View>
  )
}

type TableRowProps = {
  children?: JSX.Element[] | JSX.Element
}
export const TableRow = (props: TableRowProps) => {
  return (
    <View style={styles.row}>
      {props.children && props.children}
    </View>
  )
}