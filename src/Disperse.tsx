import { useState } from "react";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';


const Disperse = () => {
    const [addressAndAmount, setAddressAndAmount] = useState<any>();
    const [addressAndAmountJson, setAddressAndAmountJson] = useState<any>([]);
    const [showDuplicateError, setShowDuplicateError] = useState(false);
    const [showError, setShowError] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [msg, setMsg] = useState('');

    const onSubmit = async (e: any) => {
        e.preventDefault();
        setAddressAndAmountJson([])
        let validate = await validateFileds();
        if (validate) {
            setShowError(false);
            setShowSuccess(true);
            setMsg(`Success`);
        }
    }

    const getFieldValue = async () => {
        var lines = addressAndAmount.trim().replace(/,/g, ' ').replace('=', ' ').split(/\r|\r\n|\n/);
        let dataArray: any = [];
        for (let [i, element] of lines.entries()) {
            let data = element.split(' ');
            let address = data[0];
            let amount = data[1];
            if (!isNumber(amount)) {
                setShowSuccess(false);
                setShowError(true);
                setMsg(`Line ${i + 1} wrong number`);
                return false;
            }
            dataArray.push({ address, amount });
        }
        await setAddressAndAmountJson(dataArray);
        return dataArray;
    }


    const validateFileds = async () => {
        let fieldValues = await getFieldValue();
        let duplicateRecords = await checkDuplicate(fieldValues);
        if (duplicateRecords.length) {
            let msg: string = '';
            for (let [j, element] of duplicateRecords.entries()) {
                msg += `Address ${element.address} encountered duplicate in line : `
                for (let [lineIndex, line] of element.lines.entries()) {
                    msg += line + `${element.lines[lineIndex + 1] ? ',' : ''}` + "\n"
                }
            }
            setShowSuccess(false);
            setShowDuplicateError(true);
            setMsg(msg);
            return false;
        }
        return true;
    }

    const checkDuplicate = async (fieldValues: any) => {
        let duplicateRecords: any = []
        for (let [i, element] of fieldValues.entries()) {
            for (let [j, subElement] of fieldValues.entries()) {
                if (element.address === subElement.address && i !== j) {
                    var result = duplicateRecords.filter(obj => {
                        return obj.address === subElement.address
                    })
                    if (!result.length) {
                        let data = {
                            address: element.address,
                            amount: [
                                element.amount,
                                subElement.amount
                            ],
                            lines: [
                                i + 1,
                                j + 1
                            ]
                        }
                        duplicateRecords.push(data)
                    } else if (result.length && result[0]?.lines.indexOf(j + 1) === -1) {
                        let lines = result[0]?.lines;
                        lines.push(j + 1);
                        var filteredObjIndex = duplicateRecords.findIndex(function (item, i) {
                            return item.address === result[0].address
                        });
                        duplicateRecords[filteredObjIndex].lines = lines;
                    }
                }
            }
        }
        return duplicateRecords;
    }

    function isNumber(value: any) {
        return (value.match(/^-?\d*(\.\d+)?$/));
    }

    const action = async (type: string) => {
        var results: any = [];
        for (let [i, element] of addressAndAmountJson.entries()) {
            var filteredObjIndex = results.findIndex(function (item, i) {
                return item.address === element.address
            });
            if (filteredObjIndex === -1 && type === 'keepFirst') {
                results.push(element)
            } else if (type === 'combineBalance') {
                let amount = results[filteredObjIndex].amount;
                amount = parseInt(amount) + parseInt(element.amount);
                results[filteredObjIndex].amount = amount;
            }
            setShowDuplicateError(false);
        }
        let value: string = '';
        for (let [j, element] of results.entries()) {
            value += element.address + ' ' + element.amount + "\n"
        }
        setAddressAndAmount(value)
    }

    return (
        <>
            <section id="cover">
                <div id="cover-caption">
                    <div id="container" className="container">
                        <div className="row">
                            <div className="col-sm-10 offset-sm-1 text-center">
                                <Form onSubmit={onSubmit}>
                                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                        <Form.Label>Address with Amounts</Form.Label>
                                        <Form.Control as="textarea" cols={40} rows={5} required value={addressAndAmount} onChange={(e) => setAddressAndAmount(e.target.value)} />
                                    </Form.Group>
                                    <div className='linenumbers'></div>

                                    <span className="sub-text">Separated by ',' or '' or '=' </span>
                                    <br />
                                    {showError || showSuccess ? <Alert variant={showError ? 'danger' : 'success'}>
                                        <p>
                                            {msg}
                                        </p>
                                    </Alert> : ''}

                                    {showDuplicateError && !showSuccess ? <Alert variant={'danger'}>
                                        <p>
                                            {msg}
                                        </p>
                                        <hr />
                                        <div className="d-flex justify-content-end">
                                            <Button variant="outline-danger mr-10" onClick={(e) => action('keepFirst')}>
                                                Keep the first one
          </Button>
                                            <Button variant="outline-danger" onClick={(e) => action('combineBalance')}>
                                                Combine Balance
          </Button>
                                        </div>
                                    </Alert> : ''}
                                    <Button variant="primary" type="submit" className="mt-3 w-100">
                                        Next
                                     </Button>
                                </Form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </>
    )
}


export default Disperse;