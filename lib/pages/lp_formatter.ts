import { parse as dateParse } from 'date-fns';

class Formatter {
    format(fieldData: any, data: any): any {
        try {
            return (this as any)[fieldData.format](fieldData, data);
        } catch (error) {
            throw new Error(`Class \`${this.constructor.name}\` does not implement \`${fieldData.format}\``);
        }
    }

    phone(field: any, data: any): string {
        return data[field.key].replace(/[-\s]/g, '');
    }

    postalcode(field: any, data: any): string {
        const postalCode = data[field.key].replace(/\s/g, '');
        const usPostalcodeRegex = /^[0-9]{5}$|^[0-9]{5}-[0-9]{4}$/;
        if ('depends_on' in field && field.depends_on in data && data[field.depends_on] === 'US' && !usPostalcodeRegex.test(postalCode)) {
            return '';
        } else {
            return postalCode;
        }
    }

    date(field: any, data: any): string {
        try {
            const dt = dateParse(data[field.key]);
            return dt.toISOString().split('T')[0].replace(/-/g, '');
        } catch (error) {
            return '';
        }
    }

    orderid(field: any, data: any): string {
        return data[field.key].replace(/[-\s]/g, '');
    }

    flipBoolean(field: any, data: any): boolean {
        const strVal = String(data[field.key]);
        return strVal.toLowerCase() === 'false' || strVal.toLowerCase() === 'no' || strVal === '0' ? true : false;
    }

    yesNoValue(value: any): string {
        const valStr = String(value);
        return valStr.toLowerCase() === 'true' || valStr === '1' || valStr.toLowerCase() === 'yes' ? 'Yes' : 'No';
    }
}

const formatter = new Formatter();
export default formatter;