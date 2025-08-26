
import os
import base64
import tempfile
import selenium
from pathlib import Path
from mjml import mjml2html
import re
import uuid 
import shutil
import datetime

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By

import os
from PIL import Image




def setup_folder(test_case, folder_name):

    src_folder = os.path.join("test_cases", test_case)

    test_case_path = os.path.join("generated_emails", test_case)
    
    if not os.path.isdir(test_case_path):
        os.mkdir(test_case_path)

    destination_path = os.path.join(test_case_path, folder_name)

    
    if not os.path.isdir(destination_path):
        os.mkdir(destination_path)

        
    # Copy all files
    for file_name in os.listdir(src_folder):
        src_path = os.path.join(src_folder, file_name)
        dst_path =  os.path.join(destination_path, file_name)
 
        
        if os.path.isfile(src_path):  # only copy files, not subfolders
            shutil.copy2(src_path, dst_path)  # copy2 preserves metadata



def inject_wrapper(html: str) -> str:
    """
    Wrap all email markup in #email-root for consistent element screenshots.
    Always applies, no conditional checks.
    """
    # Inject CSS into <head>
    if '<head' in html:
        html = re.sub(
            r'(<head[^>]*>)',
            r'\1<style>html,body{margin:0;padding:0;}#email-root{display:inline-block;}</style>',
            html,
            count=1
        )
    else:
        html = (
            "<head><style>html,body{margin:0;padding:0;}#email-root{display:inline-block;}</style></head>"
            + html
        )

    # Wrap body contents
    html = re.sub(r'(<body[^>]*>)', r'\1<div id="email-root">', html, count=1)
    html = html.replace("</body>", "</div></body>", 1)
    return html

def create_full_screenshot(base_mjml, test_case):

    folder_name = f"{datetime.datetime.now()}"
    setup_folder(test_case, folder_name)

    mjml_with_images = base_mjml.replace('="/uploads/', f'="')
    html_content = mjml2html(mjml_with_images)

    # CHANGED: always inject wrapper
    html_content = inject_wrapper(html_content)

    email_html_file = os.path.join("generated_emails", test_case, folder_name, "email.html")
    with open(email_html_file, "w") as file:
        file.write(html_content)

    output_path = os.path.join("generated_emails", test_case, folder_name, "screenshot.png")
    return screenshot_html(email_html_file, output_path)

def screenshot_html(html_file_path, output_path="screenshot.png", width=600, height=3000):
    # Chrome options
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument(f"--window-size={width},{height}")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        abs_path = os.path.abspath(html_file_path)
        file_url = f"file://{abs_path}"
        driver.get(file_url)
        driver.implicitly_wait(2)

        # CHANGED: assume wrapper exists
        email_root = driver.find_element(By.CSS_SELECTOR, "#email-root")

        # Adjust window to element height
        content_height = driver.execute_script(
            "return Math.ceil(document.querySelector('#email-root').getBoundingClientRect().height);"
        )
        
        try:
            driver.set_window_size(width, content_height * 1.1)
        except WebDriverException:
            pass

        # CHANGED: always screenshot the element
        email_root.screenshot(output_path)
        print(f"Element screenshot saved to: {output_path}")

    finally:
        driver.quit()

    return output_path 
