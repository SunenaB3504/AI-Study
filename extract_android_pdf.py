import PyPDF2
import os

def extract_pdf_content(pdf_path, output_path):
    """Extract text content from PDF file"""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)

            print(f"PDF loaded successfully. Total pages: {len(pdf_reader.pages)}")

            extracted_text = ""

            for page_num in range(len(pdf_reader.pages)):
                try:
                    page = pdf_reader.pages[page_num]
                    text = page.extract_text()

                    if text.strip():  # Only add non-empty pages
                        extracted_text += f"\n=== PAGE {page_num + 1} ===\n"
                        extracted_text += text + "\n"

                    # Progress indicator
                    if (page_num + 1) % 50 == 0:
                        print(f"Processed {page_num + 1}/{len(pdf_reader.pages)} pages...")

                except Exception as e:
                    print(f"Error extracting page {page_num + 1}: {e}")
                    continue

            # Save extracted content
            with open(output_path, 'w', encoding='utf-8') as output_file:
                output_file.write(extracted_text)

            print(f"\nExtraction complete! Content saved to: {output_path}")
            print(f"Total characters extracted: {len(extracted_text)}")
            print(f"Total pages processed: {len(pdf_reader.pages)}")

    except Exception as e:
        print(f"Error processing PDF: {e}")

if __name__ == "__main__":
    pdf_path = "Professional_Android_Application_Development.pdf"
    output_path = "android_development.txt"

    if os.path.exists(pdf_path):
        print(f"Starting extraction from: {pdf_path}")
        extract_pdf_content(pdf_path, output_path)
    else:
        print(f"PDF file not found: {pdf_path}")
        print("Please ensure the PDF file is in the current directory.")