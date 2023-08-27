from django import forms



class NewPostForm(forms.Form):
    text = forms.CharField(label='', widget=forms.Textarea(attrs={
        "rows": "5",
        "cols": "30",
        "placeholder": "What's on your mind?"
    })) 