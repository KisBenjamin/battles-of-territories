import pandas as pd
from thefuzz import fuzz
import google.generativeai as genai
import time


genai.configure(api_key="api")
model = genai.GenerativeModel('gemini-1.5-flash')


df_dbpedia = pd.read_csv('dbpedia_battles.csv')
df_cow = pd.read_csv('EUbattles.csv')

trusted_sources = "Encyclopedia Britannica, History.com, Warfare History Network, or reliable university archives"

for (index1, row_db), (index2, row_cow) in zip(df_dbpedia.iterrows(), df_cow.iterrows()):
    
    name_db = str(row_db.get('battle_name', ''))
    name_cow = str(row_cow.get('battle_name', ''))
    
    similarity = fuzz.token_sort_ratio(name_db, name_cow)
    
    if similarity > 75:
        print(f"\n[MATCH FOUND] DBpedia: '{name_db}' | COW: '{name_cow}' (Similarity: {similarity}%)")
        
        prompt = f"""
        Act as an expert military historian. I have a battle match from two databases: '{name_db}'.
        Please perform a quick fact-check using information typically found in the following sources: {trusted_sources}.
        Briefly provide the exact date, the belligerents, and the clear outcome or territorial impact of the battle. 
        Respond in English. Keep your answer concise, maximum 3-4 sentences.
        """
        
        try:
            response = model.generate_content(prompt)
            print(f"--- AI Fact-Check ---\n{response.text.strip()}\n-------------------------")
        except Exception as e:
            print(f"Error during API call: {e}")
            
        time.sleep(2)