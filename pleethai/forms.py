from django import forms

# field
NAME_LABEL = '名前'
NAME_PLACEHOLDER = 'お名前（省略可）'
MAIL1_LABEL = 'メールアドレス'
MAIL1_PLACEHOLDER = 'メールアドレス（省略可）'
MAIL2_LABEL = 'メールアドレス確認用'
MAIL2_PLACEHOLDER = 'メールアドレス確認用（省略可）'
CONTENT_LABEL = 'リクエスト内容'
CONTENT_PLACEHOLDER = '（例）ภาษาไทย（タイ語）が登録されていません。　「永遠に」ってタイ語でどう言いますか？　単語のお気に入り機能が欲しいです。'
# error message
ERROR_MAIL_UNMATCH = 'メールアドレスが確認用と一致しません。'


class RequestForm(forms.Form):
    '''request mail form
    '''
    name = forms.CharField(label=NAME_LABEL, required=False, widget=forms.TextInput(
        attrs={
            'placeholder': NAME_PLACEHOLDER,
        }))
    mail1 = forms.EmailField(label=MAIL1_LABEL, required=False, widget=forms.EmailInput(
        attrs={
            'placeholder': MAIL1_PLACEHOLDER,
        }))
    mail2 = forms.EmailField(label=MAIL2_LABEL, required=False, widget=forms.EmailInput(
        attrs={
            'placeholder': MAIL2_PLACEHOLDER,
            'oncopy': 'return false',
            'onpaste': 'return false',
            'oncontextmenu': 'return false',
        }))
    content = forms.CharField(label=CONTENT_LABEL, widget=forms.Textarea(
        attrs={
            'placeholder': CONTENT_PLACEHOLDER,
        }))

    def clean(self):
        '''complex validation such as validation of multiple fields
        '''

        super().clean()
        cleaned_data = self.cleaned_data

        # validation of mail1 & mail2
        cd_mail1 = cleaned_data.get('mail1')
        cd_mail2 = cleaned_data.get('mail2')
        # mail address match check
        if cd_mail1 != cd_mail2:
            msg = ERROR_MAIL_UNMATCH
            self.add_error('mail1', msg)
