import ToolPage from '../../components/ToolPage';
import UnitConverterTool from '../../components/UnitConverterTool';
import { getTool } from '../../lib/tools';

const tool = getTool('unit-converter');

export const metadata = {
  title: 'Unit Converter: Convert Length, Weight, and More Free',
  description:
    'Free online unit converter. Convert length, weight, temperature, volume, area, speed, time, and data units instantly. No signup, works in your browser, and gives accurate results in real time.',
  alternates: { canonical: '/unit-converter' },
  openGraph: {
    title: 'Unit Converter: Convert Length, Weight, and More Free | Craftora',
    description: 'Convert length, weight, temperature, volume, speed, and more, free and instant, right in your browser.',
    url: 'https://craftora.dev/unit-converter',
    type: 'website',
  },
};

const howItWorks = [
  ['Pick a category', 'Choose what you are converting: length, weight, temperature, volume, area, speed, time, or data.'],
  ['Enter your value', 'Type the number and choose the unit you are converting from and the unit you want.'],
  ['See the result instantly', 'The converted value updates live as you type. Use the swap button to flip the units.'],
];

const features = [
  'Convert length, weight, temperature, volume, area, speed, time, and data.',
  'Results update instantly as you type, with no button to press.',
  'Swap the from and to units with a single click.',
  'Accurate conversions, including proper temperature formulas for Celsius, Fahrenheit, and Kelvin.',
  'Runs entirely in your browser with nothing uploaded and no signup.',
  'Completely free with no ads getting in the way.',
];

const faqs = [
  ['How do I convert units for free?', 'Pick a category above, enter a value, and choose the units to convert from and to. The result appears instantly. It is free with no signup and works right in your browser.'],
  ['What units can I convert?', 'Craftora converts length (like meters, feet, miles), weight (kilograms, pounds, ounces), temperature (Celsius, Fahrenheit, Kelvin), volume, area, speed, time, and digital data sizes.'],
  ['How do I convert Celsius to Fahrenheit?', 'Choose the Temperature category, enter your value, set from to Celsius and to to Fahrenheit. The tool uses the correct formula, so the result is accurate, not just a rough estimate.'],
  ['Are the conversions accurate?', 'Yes. Each unit uses its standard conversion factor, and temperature uses the proper formulas rather than simple multiplication, so results are precise.'],
  ['Does it work offline in my browser?', 'The conversions run entirely in your browser, so once the page is loaded, converting is instant and nothing is sent to any server.'],
  ['Is there a limit on how many conversions I can do?', 'No. You can convert as many values as you like, as often as you like, completely free.'],
];

export default function UnitConverterPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <UnitConverterTool />
    </ToolPage>
  );
}
