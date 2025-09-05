import PyPDF2

def extract_text_from_pdf(pdf_path, output_txt_path):
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text = ''
        for page in reader.pages:
            text += page.extract_text() + '\n'
    
    with open(output_txt_path, 'w', encoding='utf-8') as output_file:
        output_file.write(text)
    print(f"Text extracted to {output_txt_path}")

if __name__ == "__main__":
    pdf_path = r"c:\Users\Admin\Sunil\Study\full-stack.pdf"
    output_txt_path = r"c:\Users\Admin\Sunil\Study\full-stack.txt"
    extract_text_from_pdf(pdf_path, output_txt_path)