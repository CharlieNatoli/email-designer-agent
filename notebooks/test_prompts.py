import os
import base64
from openai import OpenAI
import openai
from PIL import Image
import IPython.display as display

from save_images import create_full_screenshot

from pydantic import BaseModel, Field
from typing import List, Literal, Optional, Dict, Any
import json
from mjml import mjml2html
from enum import Enum

import uuid

import asyncio
from playwright.async_api import async_playwright
import re
import anthropic


from dotenv import load_dotenv

# Load ../.env relative to the notebook
load_dotenv("../.env")


IMAGE_EXTS = (".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tif", ".tiff")

def _image_dims(path: str) -> Optional[tuple]:
    try:
        with Image.open(path) as im:
            return im.size  # (width, height)
    except Exception:
        return None

def _load_analysis_json(folder_name: str, image_filename: str) -> Dict[str, Any]:
    """
    Look for ./image_analysis/<folder_name>/<image_stem>.json
    Returns {} if not present or invalid.
    """
    stem, _ = os.path.splitext(image_filename)
    json_path = os.path.join(".", "image_analysis", folder_name, f"{stem}.json")
    if not os.path.exists(json_path):
        return {}
    try:
        with open(json_path, "r") as f:
            data = json.load(f)
        # Normalize expected keys to avoid KeyErrors
        if not isinstance(data, dict):
            return {}
        return data
    except Exception:
        return {}

def format_image_info_for_system_prompt(folder_name: str) -> str:
    
    folder_path = os.path.join(".", "test_cases", folder_name)

    if not os.path.isdir(folder_path):
        return "No uploaded images yet. Folder not created"

    # Gather image files
    files = [
        f for f in sorted(os.listdir(folder_path))
        if f.lower().endswith(IMAGE_EXTS)
    ]
    if not files:
        return "No uploaded images yet. No images"

    parts: List[str] = []
    for fname in files:
        fpath = os.path.join(folder_path, fname)

        dims = _image_dims(fpath)
        dims_str = f"{dims[0]}x{dims[1]}" if dims else "unknown size"

        meta = _load_analysis_json(folder_name, fname)
        # Safely pull optional fields
        image_contents = meta.get("image_contents", None)
        overlay_text = meta.get("overlay_text", None)
        image_good_for = meta.get("image_good_for", None)
        suggested_alt_text = meta.get("suggested_alt_text", None)

        # Format tags
        if isinstance(image_good_for, list) and image_good_for:
            tags_str = f"tags: {', '.join(image_good_for)}"
        else:
            tags_str = "tags: none"

        contents_str = image_contents if image_contents else "n/a"
        text_str = overlay_text if overlay_text else "n/a"
        alt_str = suggested_alt_text if suggested_alt_text else "n/a"

        parts.append(
            f"- image_filename: {fname}, size: {dims_str}, "
            f"contents: {contents_str}, text: {text_str}, "
            f"{tags_str}, suggested_alt_text: {alt_str}"
        )

    return "Available uploaded images (use image_filename to reference images):\n" + "\n".join(parts)





def generate_emails_from_prompt(system_prompt, test_case, creative_brief, has_plan_step_in_output=True, provider='openai', reasoning_effort='minimal'):
    if provider=='openai':
        client = OpenAI()
        result = client.responses.create(
          model= "gpt-5",
          instructions=system_prompt.format(imageContext=format_image_info_for_system_prompt(test_case)), 
          input= creative_brief,
          reasoning= {"effort": reasoning_effort}, 
          )
        output_text = result.output_text
        
    elif provider =='anthropic':
        client = anthropic.Anthropic( 
            api_key=os.environ.get("ANTHROPIC_API_KEY")
        )
        message = client.messages.create(
            model="claude-opus-4-1-20250805",
            max_tokens=1024*4,
            system=system_prompt.format(imageContext=format_image_info_for_system_prompt(test_case)), 
            messages=[ 
                {
                    "role": "user", "content":creative_brief
                }
            ]
        )
        output_text = message.content[0].text
    else: 
        raise Exception(f'invalid provider: {provider}. Must choose "openai" or "anthropic"')
 
    if has_plan_step_in_output:
        output_text = re.search(r'(?s)\{.*\}', output_text).group(0)
        print('\n\nPLANNING STEP\n\n', json.loads(output_text)['planning'])
        output_mjml = json.loads(output_text)['emailDraftMJML']
    else:
        output_mjml = output_text
        
    print('\n\nMJML\n\n', output_mjml)
    
    display.display(display.Image(create_full_screenshot(output_mjml, test_case)))
      
